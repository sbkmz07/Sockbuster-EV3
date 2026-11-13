"""Genera versiones SVG estáticas de los diagramas para uso offline y GitHub Pages.
Necesita Graphviz (comando dot). Los modelos fuente UML editables están en *.puml.
"""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'diagrams'
OUT.mkdir(exist_ok=True)
head='''digraph G { graph [bgcolor="transparent", pad=.25, nodesep=.55, ranksep=.9, fontname="Arial", fontsize=14]; node [fontname="Arial", fontsize=12, color="#7961AD", penwidth=1.5]; edge [fontname="Arial", fontsize=10, color="#806AA8", fontcolor="#554675", arrowsize=.65, penwidth=1.5];'''
def uml(name,attributes,methods):
    def r(v): return v.replace('"','\\"').replace('<','&lt;').replace('>','&gt;')
    parts=[f'<TR><TD BGCOLOR="#35235F" ALIGN="LEFT" CELLPADDING="8"><FONT COLOR="white" POINT-SIZE="14"><B>{r(name)}</B></FONT></TD></TR>']
    parts.append('<TR><TD ALIGN="LEFT" CELLPADDING="8"><FONT COLOR="#25203E">'+('<BR ALIGN="LEFT"/>'.join(r(s) for s in attributes) if attributes else '—')+'</FONT></TD></TR>')
    parts.append('<TR><TD ALIGN="LEFT" CELLPADDING="8"><FONT COLOR="#25203E">'+('<BR ALIGN="LEFT"/>'.join(r(s) for s in methods) if methods else '—')+'</FONT></TD></TR>')
    return '<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" COLOR="#AB98C8" BGCOLOR="#F8F5FF">'+''.join(parts)+'</TABLE>'
classes=[
 ('Usuario',['+ id: UUID','+ nombre: String','+ email: String','+ rol: String'],['+ iniciarSesion()','+ publicarResena()']),
 ('Administrador',[],['+ registrarCalcetin()','+ actualizarStock()','+ modificarPrecio()']),
 ('Cliente',[],['+ agregarAlCarrito()','+ finalizarPedido()']),
 ('Calcetin',['+ id: String','+ nombre: String','+ precio: Decimal','+ stock: int','+ tallas: String[]','+ imagen: String'],['+ hayStock(cantidad): bool']),
 ('Categoria',['+ id: String','+ nombre: String'],['+ clasificar()']),
 ('ObraTematica',['+ titulo: String','+ tipo: String'],['+ asociar()']),
 ('Carrito',[],['+ agregar()','+ modificarCantidad()','+ calcularTotal()']),
 ('ItemCarrito',['+ talla: String','+ cantidad: int'],['+ subtotal(): Decimal']),
 ('Pedido',['+ id: String','+ fecha: DateTime','+ clienteInvitado: String','+ total: Decimal','+ estado: String'],['+ simularPago(): bool']),
 ('DetallePedido',['+ talla: String','+ cantidad: int','+ precioUnitario: Decimal'],[]),
 ('Resena',['+ puntuacion: 1..5','+ comentario: String','+ fecha: DateTime'],['+ publicar()']),
]
code=head+'\n graph [rankdir=LR, ranksep=1.25, nodesep=.5];\nnode [shape=plain];\n'+ '\n'.join(f'{n} [label=<{uml(n,a,m)}>];' for n,a,m in classes)+'''
Usuario -> Administrador [arrowhead=empty, dir=back, label="hereda"];
Usuario -> Cliente [arrowhead=empty, dir=back, label="hereda"];
Categoria -> Calcetin [arrowtail=odiamond, dir=both, arrowhead=none, taillabel="1", headlabel="0..*", label="clasifica"];
ObraTematica -> Calcetin [arrowhead=vee, taillabel="1", headlabel="0..*", label="inspira"];
Usuario -> Resena [arrowhead=none, taillabel="1", headlabel="0..*", label="escribe"];
Resena -> Calcetin [arrowhead=vee, taillabel="0..*", headlabel="1", label="valora"];
Usuario -> Carrito [arrowhead=none, taillabel="0..1", headlabel="0..1",label="usa"];
Carrito -> ItemCarrito [arrowtail=diamond,dir=both,arrowhead=none,taillabel="1",headlabel="0..*",label="contiene"];
ItemCarrito -> Calcetin [arrowhead=vee, taillabel="0..*", headlabel="1", label="selecciona"];
Usuario -> Pedido [arrowhead=none,taillabel="0..1",headlabel="0..*",label="realiza"];
Pedido -> DetallePedido [arrowtail=diamond,dir=both,arrowhead=none,taillabel="1",headlabel="1..*",label="contiene"];
DetallePedido -> Calcetin [arrowhead=vee,taillabel="0..*",headlabel="1",label="incluye"];
}
'''

def component(title,subtitle='',colour='#F8F5FF'):
    return f'<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" COLOR="#8068B0" BGCOLOR="{colour}"><TR><TD CELLPADDING="11" ALIGN="CENTER"><FONT POINT-SIZE="11" COLOR="#655780">&lt;&lt;component&gt;&gt;</FONT><BR/><FONT POINT-SIZE="14" COLOR="#2C204B"><B>{title}</B></FONT>{("<BR/><FONT POINT-SIZE=\"11\" COLOR=\"#61567B\">"+subtitle+"</FONT>") if subtitle else ""}</TD></TR></TABLE>>'

dev=head+'''graph [rankdir=LR];node [shape=plain];
subgraph cluster_pages {label="Interfaz web";color="#B6AAE0";style="rounded,dashed"; index [label='''+component('index.html','Inicio')+'''];catalogo [label='''+component('catalogo.html','Tienda interactiva')+'''];diagramas [label='''+component('diagramas.html','Cinco vistas UML')+'''];css [label='''+component('css/styles.css','Estilos')+'''];}
subgraph cluster_js {label="Módulos ES6 / JavaScript";color="#B6AAE0";style="rounded,dashed";home [label='''+component('js/home.js')+'''];app [label='''+component('js/catalog.js')+'''];db [label='''+component('js/db.js','Acceso a datos')+'''];data [label='''+component('js/data.js','Productos y categorías')+'''];config [label='''+component('js/config.js','Configuración nube')+'''];students [label='''+component('js/students.js','Integrantes')+'''];}
local [shape=cylinder,style=filled,fillcolor="#E9F9DA",label="localStorage\\nDemo y pedidos"];
cloud [shape=cylinder,style=filled,fillcolor="#E9F9F4",label="Supabase Auth / DB\\nOpcional + JWT"];
images [shape=folder,style=filled,fillcolor="#E7F0FA",label="assets/diagrams/*.svg\\ny assets/products/*.svg"];
index -> home; catalogo -> app;diagramas -> images;home -> students;home -> data;home -> db;app -> data;app -> db; db -> config; db -> local [label="base (demo)"];db -> cloud [style=dashed,label="configurable"];
index -> css [style=dotted];catalogo -> css [style=dotted];diagramas -> css [style=dotted];
}
'''

base_activity='''graph [rankdir=TB, splines=polyline];node [shape=box,style="rounded,filled",fillcolor="#F4EDFF",color="#7B5AA7",margin=".18,.11"];edge [color="#806AA8"];
start [shape=circle,fillcolor="#D5FF54",label="",width=.25];end [shape=doublecircle,fillcolor="#D5FF54",label="",width=.26];'''
checkout=head+base_activity+'''
open [label="Abrir carrito (RF02)"];has [shape=diamond,label="¿Tiene productos?"];
no [label="Mostrar carrito vacío"];fork [shape=box,style=filled,fillcolor="#2A1D4D",label="",height=.09,width=2.25];
stock [label="Verificar stock y cantidades"];total [label="Calcular subtotales y total"];
join [shape=box,style=filled,fillcolor="#2A1D4D",label="",height=.09,width=2.25];valid [shape=diamond,label="¿Stock suficiente?"];
err [label="Mostrar aviso de stock"];name [label="Ingresar nombre del cliente"];payment [label="Simular verificación de pago"];id [label="Generar ID único de pedido"];save [label="Guardar pedido en navegador"];summary [label="Mostrar resumen y total"];
start -> open -> has;has -> no [label="No"];no -> end;has -> fork [label="Sí"];fork -> stock;fork -> total;stock -> join;total -> join;join -> valid;valid -> err [label="No"];err -> end;valid -> name [label="Sí"];name -> payment -> id -> save -> summary -> end;
}
'''
filtering=head+base_activity+'''
input [label="Seleccionar categoría o escribir búsqueda (RF01)"];
read [label="Obtener calcetines desde db.js"];receive [label="Recibir imágenes, precio, tallas y stock"];
filter [label="Filtrar por colección + texto"];sort [label="Aplicar ordenamiento elegido"];
empty [shape=diamond,label="¿Hay resultados?"];grid [label="Mostrar tarjetas de producto y existencias"];none [label="Informar sin resultados"];
detail [label="Abrir ficha con foto, talla y reseñas"];
start -> input -> read -> receive -> filter -> sort -> empty;empty -> grid [label="Sí"];empty -> none [label="No"];grid -> detail -> end;none -> end;
}
'''
reviews=head+base_activity+'''
open [label="Abrir ficha de producto (RF04)"];auth [shape=diamond,label="¿Sesión iniciada?"];login [label="Pedir registro o inicio de sesión"];stars [label="Elegir valoración: 1 a 5 estrellas"];comment [label="Escribir comentario"];valid [shape=diamond,label="¿Validación correcta? "];error [label="Mostrar error de validación"];save [label="Guardar reseña vinculada al usuario"];show [label="Mostrar estrellas y comentario"];
start -> open -> auth;auth -> login [label="No"];login -> end;auth -> stars [label="Sí"];stars -> comment -> valid;valid -> error [label="No"];error -> end;valid -> save [label="Sí"];save -> show -> end;
}
'''
physical=head+'''graph [rankdir=LR];node [shape=box,style="rounded,filled",fillcolor="#F6F2FF",margin=".18,.12"];
subgraph cluster_client {label="Equipo del usuario";color="#A99CCF";browser [label="Navegador web\\nCliente HTTP(S)",shape=component];ls [label="localStorage\\nDemo / carrito / pedidos",shape=cylinder,fillcolor="#E6F7DC"]}
subgraph cluster_host {label="Nube: GitHub Pages";color="#A99CCF";host [label="Servidor estático + CDN\\nindex.html | catalogo.html | diagramas.html\\nCSS | JS | SVG",shape=box3d,fillcolor="#E9E1FC"]}
subgraph cluster_cloud {label="Nube OPCIONAL: Supabase";color="#83C7B3";auth [label="Supabase Auth\\nJWT real",fillcolor="#DDF6EF"];api [label="API REST + políticas RLS",fillcolor="#DDF6EF"];pg [label="PostgreSQL\\nproductos / reseñas / perfiles",shape=cylinder,fillcolor="#DDF6EF"]}
browser -> host [label="HTTPS / 443 - sitio público"];browser -> ls [label="modo DEMO",dir=both];browser -> auth [style=dashed,label="registro / login HTTPS"];browser -> api [style=dashed,label="Bearer JWT HTTPS"];auth -> api [style=dotted,label="identidad"];api -> pg [label="SQL + permisos"];}
'''
use=head+'''graph [rankdir=LR, nodesep=.4, ranksep=1.2];node [shape=ellipse,style=filled,fillcolor="#F1EAFE",color="#A28CD1",margin=".22,.12"];
visitor [shape=box,style="rounded,filled",fillcolor="#DFF6EC",label="«actor»\\nVisitante"];fan [shape=box,style="rounded,filled",fillcolor="#DFF6EC",label="«actor»\\nFan registrado"];admin [shape=box,style="rounded,filled",fillcolor="#DFF6EC",label="«actor»\\nAdministrador"];
subgraph cluster_cases {label="SISTEMA SOCKBUSTER";color="#A99CCF";style="rounded,dashed";
cu1 [label="CU01 Explorar y filtrar\\ncolecciones (RF01)"];
cu2 [label="CU02 Ver producto, precio,\\nstock y tallas (RF01)"];
cu3 [label="CU03 Gestionar carrito (RF02)"];
cu4 [label="CU04 Simular checkout\\ne ID de pedido (RF02)"];
cu5 [label="CU05 Registrar / iniciar sesión"];
cu6 [label="CU06 Publicar reseñas\\n1 a 5 estrellas (RF04)"];
cu7 [label="CU07 Registrar calcetín,\\nstock y precios (RF03)"];
cu8 [label="CU08 Autenticar JWT admin\\n(RNF02 en nube)"];}
visitor -> cu1 [dir=none];visitor -> cu2 [dir=none];visitor -> cu3 [dir=none];visitor -> cu4 [dir=none];
fan -> cu5 [dir=none];fan -> cu6 [dir=none];admin -> cu7 [dir=none];cu4 -> cu3 [style=dashed,label="<<include>>",constraint=false];cu6 -> cu5 [style=dashed,label="<<include>>"];cu7 -> cu8 [style=dashed,label="<<include>>"];
}
'''
models={'01-vista-logica':code,'02-vista-desarrollo':dev,'03-vista-proceso-checkout':checkout,'04-vista-proceso-filtrado':filtering,'05-vista-fisica':physical,'06-escenarios-casos-uso':use,'07-vista-proceso-resenas':reviews}
for name,dot in models.items():
    p=OUT/f'{name}.dot';p.write_text(dot,encoding='utf-8')
    svg=OUT/f'{name}.svg';r=subprocess.run(['dot','-Tsvg',str(p),'-o',str(svg)],capture_output=True,text=True)
    if r.returncode: raise RuntimeError(f'{name}: {r.stderr}')
    print(name,svg.stat().st_size)
