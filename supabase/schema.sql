-- SOCKBUSTER | ESQUEMA DE DATOS + SEGURIDAD JWT/RLS (modo nube opcional)
-- Ejecutar UNA SOLA VEZ en Supabase > SQL Editor > Run.
-- Esta configuración es opcional: la web funciona sin ella en MODO DEMO LOCAL.
-- Nunca colocar una service_role/secret key en el código del navegador.

begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Fan Sockbuster',
  role text not null default 'fan' check (role in ('fan','admin')),
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  name text not null,
  franchise text not null,
  "mediaType" text not null default 'Película/serie',
  category text not null check (category in ('ciencia-ficcion','terror-80','series-drama','animacion')),
  price integer not null check (price >= 0),
  stock integer not null check (stock >= 0),
  sizes text[] not null,
  image text not null,
  description text not null default '',
  tag text not null default 'Nuevo',
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 5 and 500),
  created_at timestamptz not null default now(),
  unique (product_id,user_id)
);
create index reviews_product_id_idx on public.reviews(product_id);
create index reviews_user_id_idx on public.reviews(user_id);

-- Crea automáticamente un perfil no privilegiado al registrarse.
create function public.create_profile_after_signup()
returns trigger
language plpgsql security definer
set search_path=''
as $$
begin
  insert into public.profiles(id,display_name,role)
  values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''), 'Fan Sockbuster'),'fan');
  return new;
end;
$$;
create trigger on_sockbuster_user_created
  after insert on auth.users
  for each row execute function public.create_profile_after_signup();

-- Autoriza admin consultando una tabla protegida, nunca user_metadata editable.
create schema if not exists private;
create function private.is_admin()
returns boolean
language sql stable security definer
set search_path=''
as $$
  select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin');
$$;
revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Permisos + RLS (dos capas: GRANT y políticas).
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
revoke all on public.profiles,public.products,public.reviews from anon,authenticated;
grant select on public.profiles to authenticated;
grant select on public.products to anon,authenticated;
grant insert,update,delete on public.products to authenticated;
grant select on public.reviews to anon,authenticated;
grant insert on public.reviews to authenticated;

create policy profiles_read_self on public.profiles for select to authenticated
  using(id=(select auth.uid()));

create policy products_read_public on public.products for select to anon,authenticated using(true);
create policy products_admin_insert on public.products for insert to authenticated
  with check((select private.is_admin()));
create policy products_admin_update on public.products for update to authenticated
  using((select private.is_admin())) with check((select private.is_admin()));
create policy products_admin_delete on public.products for delete to authenticated
  using((select private.is_admin()));

create policy reviews_public_read on public.reviews for select to anon,authenticated using(true);
create policy reviews_signed_in_add on public.reviews for insert to authenticated
  with check(user_id=(select auth.uid()));

-- Datos de ejemplo: mismos diseños usados en modo DEMO.
insert into public.products(id,name,franchise,"mediaType",category,price,stock,sizes,image,description,tag) values
('sb001','Galaxia Retro','Órbita 1984','Película ficticia','ciencia-ficcion',6990,14,array['35-38','39-42','43-46'],'assets/products/galaxia.svg','Estrellas, planetas y aventuras intergalácticas en cada paso.','Más vendido'),
('sb002','Viaje Estelar','Ruta a las Estrellas','Serie ficticia','ciencia-ficcion',7490,9,array['35-38','39-42'],'assets/products/estelar.svg','Un diseño espacial para quienes sueñan en grande.','Nuevo'),
('sb003','Noche Neón','La Casa del Misterio','Película ficticia','terror-80',6490,11,array['35-38','39-42','43-46'],'assets/products/neon.svg','Colores ochenteros, relámpagos y un toque de suspenso.','Edición retro'),
('sb004','Monstruo Pixel','Pantalla del Horror','Película ficticia','terror-80',6990,6,array['39-42','43-46'],'assets/products/pixel.svg','Un homenaje a las criaturas de los videojuegos clásicos.','Pocas unidades'),
('sb005','Café de Medianoche','Amigos del Barrio','Serie ficticia','series-drama',5990,20,array['35-38','39-42'],'assets/products/cafe.svg','Para maratones de series, conversaciones largas y café.','Favorito'),
('sb006','Rebobinar','Historias del Videoclub','Serie ficticia','series-drama',6490,13,array['35-38','39-42','43-46'],'assets/products/rebobinar.svg','Rayas vintage y nostalgia de una tarde frente al televisor.','Retro'),
('sb007','Planeta Dulce','La Pandilla Cósmica','Serie ficticia','animacion',5490,18,array['35-38','39-42'],'assets/products/dulce.svg','Una explosión de colores para fans de la animación.','Color total'),
('sb008','Robot Feliz','Pequeños Inventores','Serie ficticia','animacion',5990,15,array['35-38','39-42','43-46'],'assets/products/robot.svg','Robots simpáticos y energía para cada día.','Nuevo');

commit;

-- ASIGNAR ADMINISTRADOR (SOLO EN SUPABASE > SQL EDITOR, DESPUÉS DE REGISTRARTE):
-- update public.profiles set role='admin'
-- where id=(select id from auth.users where email='TU_CORREO@EJEMPLO.COM');
-- El cliente no tiene permiso SQL para editar su propio rol.
