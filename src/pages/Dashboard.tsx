import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Card, Badge, Avatar, List, Tooltip, Tag } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  MessageOutlined,
  NotificationOutlined,
  CalendarOutlined,
  TeamOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/counter-card/StatCard';
import RevenueChart from '../components/counter-card/RevenueChart';
import { supabase } from '../config/supabase';
import '../styles/Dashboard.css';

const { Title, Text } = Typography;

// Interfaces para los datos
interface Prospect {
  id: string;
  nombre: string;
  etapa: string;
  numero_whatsapp: string;
  proyecto_interesado: string;
  fecha_proximo_seguimiento: string;
  cantidad_seguimientos: number;
  inmobiliaria_id: string;
  vendedor_id?: string;
  inmobiliaria?: {
    nombre: string;
  };
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  nombre: string;
  descripcion?: string;
  unidades_disponibles?: number;
  precio_desde?: number;
  imagen_principal?: string;
  created_at?: string;
}

interface Vendedor {
  id: string;
  nombre: string;
  email: string;
  avatar_url?: string;
  prospectos_asignados?: number;
  ventas_realizadas?: number;
  activo?: boolean;
}

interface Chat {
  id: string;
  prospect_id: string;
  vendedor_id?: string;
  fecha: string;
  mensajes_count: number;
  prospect?: {
    nombre: string;
  };
}

interface CampanaPush {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_envio: string;
  destinatarios?: number;
  aperturas?: number;
  clics?: number;
  estado: string;
}

interface GlobalStats {
  total: number;
  activos: number;
  nuevosSemana: number;
  conversionRate: number;
  tiempoPromedio: number;
}

// Etapas disponibles para los prospectos
const etapas = [
  { label: 'Nuevo prospecto', value: 'Nuevo prospecto', color: 'green' },
  { label: 'Conversación', value: 'Conversación', color: 'orange' },
  { label: 'Calificado', value: 'Calificado', color: 'blue' },
  { label: 'No calificado', value: 'No calificado', color: 'red' },
  { label: 'Agendado', value: 'Agendado', color: 'purple' },
  { label: 'No interesado', value: 'No interesado', color: 'gray' },
];

// Función para calcular estadísticas
const calculateStats = (prospects: Prospect[]): GlobalStats => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const nuevosSemana = prospects.filter(p => new Date(p.created_at) > oneWeekAgo).length;
  const activos = prospects.filter(p => p.etapa !== 'No interesado').length;
  const calificados = prospects.filter(p => p.etapa === 'Calificado').length;
  const conversionRate = prospects.length > 0 ? (calificados / prospects.length) * 100 : 0;

  const completedProspects = prospects.filter(p =>
    p.etapa === 'Calificado' || p.etapa === 'No interesado'
  );
  
  let tiempoPromedio = 0;
  if (completedProspects.length > 0) {
    const totalTime = completedProspects.reduce((acc, prospect) => {
      const start = new Date(prospect.created_at);
      const end = new Date(prospect.updated_at);
      return acc + (end.getTime() - start.getTime());
    }, 0);
    tiempoPromedio = Math.round(totalTime / completedProspects.length / (1000 * 60 * 60 * 24));
  }

  return {
    total: prospects.length,
    activos,
    nuevosSemana,
    conversionRate,
    tiempoPromedio
  };
};

// Funciones para generar datos simulados
const generarProspectosSimulados = (cantidad: number): Prospect[] => {
  const etapasPosibles = ['Nuevo prospecto', 'Conversación', 'Calificado', 'No calificado', 'Agendado', 'No interesado'];
  const nombresPosibles = ['Ana García', 'Carlos López', 'María Rodríguez', 'Juan Pérez', 'Laura Martínez', 
                          'Diego Sánchez', 'Sofía Fernández', 'Javier González', 'Valentina Torres', 'Mateo Ramírez'];
  
  return Array.from({ length: cantidad }, (_, i) => {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30)); // Entre hoy y hace 30 días
    
    const updatedDate = new Date(createdDate);
    updatedDate.setDate(updatedDate.getDate() + Math.floor(Math.random() * 10)); // Entre 0 y 10 días después
    
    const nombre = nombresPosibles[Math.floor(Math.random() * nombresPosibles.length)];
    const etapa = etapasPosibles[Math.floor(Math.random() * etapasPosibles.length)];
    
    return {
      id: `p-${i + 1}`,
      nombre,
      etapa,
      numero_whatsapp: `+56 9 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      proyecto_interesado: `Proyecto ${Math.floor(Math.random() * 5) + 1}`,
      fecha_proximo_seguimiento: new Date(updatedDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cantidad_seguimientos: Math.floor(Math.random() * 8),
      inmobiliaria_id: 'simulado',
      vendedor_id: `v-${Math.floor(Math.random() * 6) + 1}`,
      created_at: createdDate.toISOString(),
      updated_at: updatedDate.toISOString()
    };
  });
};

const generarProyectosSimulados = (cantidad: number): Project[] => {
  const nombresPosibles = ['Edificio Aurora', 'Terrazas del Valle', 'Parque Residencial', 'Vista al Mar', 
                          'Torres del Bosque', 'Mirador Central', 'Condominio Las Palmas', 'Jardines del Sur'];
  
  return Array.from({ length: cantidad }, (_, i) => {
    const createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - Math.floor(Math.random() * 12)); // Entre hoy y hace 12 meses
    
    return {
      id: `proj-${i + 1}`,
      nombre: i < nombresPosibles.length ? nombresPosibles[i] : `Proyecto ${i + 1}`,
      descripcion: `Hermoso proyecto ubicado en zona privilegiada con excelentes terminaciones y amenities.`,
      unidades_disponibles: Math.floor(Math.random() * 50) + 1,
      precio_desde: (Math.floor(Math.random() * 200) + 80) * 1000000, // Entre 80M y 280M
      imagen_principal: `https://source.unsplash.com/300x200/?building,apartment&sig=${i}`,
      created_at: createdDate.toISOString()
    };
  });
};

const generarVendedoresSimulados = (cantidad: number): Vendedor[] => {
  const nombresPosibles = ['Roberto Silva', 'Carmen González', 'Felipe Morales', 'Patricia Vega',
                          'Andrés Muñoz', 'Claudia Rojas', 'Rodrigo Díaz', 'Daniela Fuentes'];
  
  return Array.from({ length: cantidad }, (_, i) => {
    return {
      id: `v-${i + 1}`,
      nombre: i < nombresPosibles.length ? nombresPosibles[i] : `Vendedor ${i + 1}`,
      email: `vendedor${i + 1}@ejemplo.com`,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombresPosibles[i] || `Vendedor ${i + 1}`)}&background=random`,
      prospectos_asignados: Math.floor(Math.random() * 15) + 1,
      ventas_realizadas: Math.floor(Math.random() * 8),
      activo: Math.random() > 0.2  // 80% de probabilidad de estar activo
    };
  });
};

const generarChatsSimulados = (cantidad: number, prospectos: Prospect[]): Chat[] => {
  return Array.from({ length: cantidad }, (_, i) => {
    const prospect = prospectos[Math.floor(Math.random() * prospectos.length)];
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 7)); // Entre hoy y hace 7 días
    
    return {
      id: `chat-${i + 1}`,
      prospect_id: prospect.id,
      vendedor_id: `v-${Math.floor(Math.random() * 6) + 1}`,
      fecha: fecha.toISOString(),
      mensajes_count: Math.floor(Math.random() * 20) + 1,
      prospect: {
        nombre: prospect.nombre
      }
    };
  });
};

const generarCampanasSimuladas = (cantidad: number): CampanaPush[] => {
  const titulosPosibles = ['Ofertas de fin de semana', 'Estreno de nuevo proyecto', 'Últimas unidades disponibles', 
                           'Descuentos especiales', 'Invitación a evento', 'Tour virtual'];
  const estadosPosibles = ['Enviada', 'Programada', 'Borrador'];
  
  return Array.from({ length: cantidad }, (_, i) => {
    const fechaEnvio = new Date();
    fechaEnvio.setDate(fechaEnvio.getDate() - Math.floor(Math.random() * 30)); // Entre hoy y hace 30 días
    
    const destinatarios = Math.floor(Math.random() * 1000) + 50;
    const aperturas = Math.floor(destinatarios * (Math.random() * 0.7 + 0.1)); // Entre 10% y 80% de apertura
    const clics = Math.floor(aperturas * (Math.random() * 0.6 + 0.1)); // Entre 10% y 70% de clics sobre aperturas
    
    return {
      id: `camp-${i + 1}`,
      titulo: i < titulosPosibles.length ? titulosPosibles[i] : `Campaña ${i + 1}`,
      descripcion: `Campaña para promover ventas y aumentar la visibilidad de los proyectos.`,
      fecha_envio: fechaEnvio.toISOString(),
      destinatarios,
      aperturas,
      clics,
      estado: estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)]
    };
  });
};

export const Dashboard = () => {
  const { user, loading: authLoading, inmobiliariaName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [campanasPush, setCampanasPush] = useState<CampanaPush[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    total: 0,
    activos: 0,
    nuevosSemana: 0,
    conversionRate: 0,
    tiempoPromedio: 0
  });
  const [etapasDistribution, setEtapasDistribution] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let inmobiliariaId = user?.inmobiliaria_id || '';
        
        
        const usarDatosSimulados = !user || !inmobiliariaId || inmobiliariaId.trim() === '';
        
        if (usarDatosSimulados) {
          // Crear datos simulados para la demostración
          const prospectsSimulados = generarProspectosSimulados(25);
          const projectsSimulados = generarProyectosSimulados(8);
          const vendedoresSimulados = generarVendedoresSimulados(6);
          const chatsSimulados = generarChatsSimulados(15, prospectsSimulados);
          const campanasSimuladas = generarCampanasSimuladas(5);
          
          // Establecer datos simulados
          setProspects(prospectsSimulados);
          setProjects(projectsSimulados);
          setVendedores(vendedoresSimulados);
          setChats(chatsSimulados);
          setCampanasPush(campanasSimuladas);
          
          // Calcular y establecer estadísticas
          setStats(calculateStats(prospectsSimulados));
          
          // Preparar datos para el gráfico de etapas
          const etapaCount: Record<string, number> = {};
          etapas.forEach(e => etapaCount[e.value] = 0);
          
          prospectsSimulados.forEach(p => {
            if (etapaCount[p.etapa] !== undefined) {
              etapaCount[p.etapa]++;
            } else {
              // Si el prospecto tiene una etapa que no está en nuestra lista predefinida,
              // asignémoslo a "Nuevo prospecto" por defecto
              etapaCount['Nuevo prospecto']++;
            }
          });
          
          const chartData = Object.keys(etapaCount).map((etapa, index) => {
            // const etapaInfo = etapas.find(e => e.value === etapa); // No utilizado
            const colors = ['#9cffba', '#6c7aff', '#ff7eb5', '#ffdd76', '#7ed1ff', '#d9d9d9'];
            return {
              name: etapa,
              value: etapaCount[etapa],
              color: colors[index % colors.length],
              percentage: prospectsSimulados.length ? Math.round((etapaCount[etapa] / prospectsSimulados.length) * 100) : 0
            };
          }).filter(item => item.value > 0);
          
          setEtapasDistribution(chartData);
          
        } else {
          
          if (!inmobiliariaId) {
            throw new Error('ID de inmobiliaria no válido');
          }
          // Obtener prospectos reales
          const { data: prospectsData, error: prospectsError } = await supabase
            .from('prospectos')
            .select('*, inmobiliaria:inmobiliarias(nombre)')
            .eq('inmobiliaria_id', inmobiliariaId);
          

          if (prospectsError) {
            throw prospectsError;
          }
          
          // Obtener proyectos reales
          console.log('Consultando proyectos para inmobiliaria_id:', inmobiliariaId);
          const { data: projectsData, error: projectsError } = await supabase
            .from('proyectos')
            .select('*')
            .eq('inmobiliaria_id', inmobiliariaId);
          
            
          if (projectsError) throw projectsError;
          // Obtener vendedores reales
          console.log('Consultando vendedores para inmobiliaria_id:', inmobiliariaId);
          const { data: vendedoresData, error: vendedoresError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('inmobiliaria_id', inmobiliariaId)
            .eq('user_rol', 'vende'); // Corregido de 'rol' a 'user_rol' según el schema
            
            
          if (vendedoresError) throw vendedoresError;
          
          // Obtener chats de la última semana
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const { data: chatsData, error: chatsError } = await supabase
            .from('chats')
            .select('*, prospect:prospectos(nombre)')
            .eq('inmobiliaria_id', inmobiliariaId)
            .gte('fecha', oneWeekAgo.toISOString());
            
          if (chatsError) throw chatsError;
          
            
          // Obtener campañas push
          console.log('Consultando campañas para inmobiliaria_id:', inmobiliariaId);
          const { data: campanasData, error: campanasError } = await supabase
            .from('campanas_push')
            .select('*')
            .eq('inmobiliaria_id', inmobiliariaId)
            .order('fecha_envio', { ascending: false });
            
            
          if (campanasError) throw campanasError;
          
          // Establecer datos reales
          const pData = prospectsData || [];
          const prjData = projectsData || [];
          const vndData = vendedoresData || [];
          const chtData = chatsData || [];
          const cmpData = campanasData || [];
          
          setProspects(pData);
          setProjects(prjData);
          setChats(chtData);
          setCampanasPush(cmpData);
          const vendedoresEnriquecidos = vndData.map((v: Vendedor) => {
            // Contar prospectos asignados a cada vendedor
            const prospectosAsignados = pData.filter((p: Prospect) => p.vendedor_id === v.id).length;
            
            // Contar ventas realizadas (prospectos calificados)
            const ventasRealizadas = pData.filter((p: Prospect) => p.vendedor_id === v.id && p.etapa === 'Calificado').length;
            
            return {
              ...v,
              prospectos_asignados: prospectosAsignados,
              ventas_realizadas: ventasRealizadas,
              avatar_url: v.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.nombre)}&background=random`,
              // Asegurarnos de que la propiedad activo esté definida
              activo: v.activo !== undefined ? v.activo : true // Valor predeterminado: activo
            };
          });
          
          setVendedores(vendedoresEnriquecidos);
          
          // Calcular y establecer estadísticas
          setStats(calculateStats(pData));
          
          // Preparar datos para el gráfico de etapas
          const etapaCount: Record<string, number> = {};
          etapas.forEach(e => etapaCount[e.value] = 0);
          
          pData.forEach((p: Prospect) => {
            if (etapaCount[p.etapa] !== undefined) {
              etapaCount[p.etapa]++;
            } else {
              etapaCount['Nuevo prospecto']++;
            }
          });
          
          const chartData = Object.keys(etapaCount).map((etapa, index) => {
            const colors = ['#9cffba', '#6c7aff', '#ff7eb5', '#ffdd76', '#7ed1ff', '#d9d9d9'];
            return {
              name: etapa,
              value: etapaCount[etapa],
              color: colors[index % colors.length],
              percentage: pData.length ? Math.round((etapaCount[etapa] / pData.length) * 100) : 0
            };
          }).filter(item => item.value > 0);
          
          setEtapasDistribution(chartData);
          
        }
      } catch (error) {
        // Intentamos usar datos simulados como fallback si hay error en datos reales
        try {
          const prospectsSimulados = generarProspectosSimulados(25);
          const projectsSimulados = generarProyectosSimulados(8);
          const vendedoresSimulados = generarVendedoresSimulados(6);
          const chatsSimulados = generarChatsSimulados(15, prospectsSimulados);
          const campanasSimuladas = generarCampanasSimuladas(5);
          
          setProspects(prospectsSimulados);
          setProjects(projectsSimulados);
          setVendedores(vendedoresSimulados);
          setChats(chatsSimulados);
          setCampanasPush(campanasSimuladas);
          
          setStats(calculateStats(prospectsSimulados));
          
          // Preparar datos para el gráfico de etapas
          const etapaCount: Record<string, number> = {};
          etapas.forEach(e => etapaCount[e.value] = 0);
          
          prospectsSimulados.forEach(p => {
            if (etapaCount[p.etapa] !== undefined) {
              etapaCount[p.etapa]++;
            } else {
              etapaCount['Nuevo prospecto']++;
            }
          });
          
          const chartData = Object.keys(etapaCount).map((etapa, index) => {
            const colors = ['#9cffba', '#6c7aff', '#ff7eb5', '#ffdd76', '#7ed1ff', '#d9d9d9'];
            return {
              name: etapa,
              value: etapaCount[etapa],
              color: colors[index % colors.length],
              percentage: prospectsSimulados.length ? Math.round((etapaCount[etapa] / prospectsSimulados.length) * 100) : 0
            };
          }).filter(item => item.value > 0);
          
          setEtapasDistribution(chartData);
        } catch (fallbackError) {
          console.error('Error en fallback a datos simulados:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
      
    };

    if (!authLoading) {
      if (user) {
        console.log('Usuario autenticado, iniciando carga de datos');
        fetchData();
      } else {
        const prospectsSimulados = generarProspectosSimulados(25);
        const projectsSimulados = generarProyectosSimulados(8);
        const vendedoresSimulados = generarVendedoresSimulados(6);
        const chatsSimulados = generarChatsSimulados(15, prospectsSimulados);
        const campanasSimuladas = generarCampanasSimuladas(5);
        
        setProspects(prospectsSimulados);
        setProjects(projectsSimulados);
        setVendedores(vendedoresSimulados);
        setChats(chatsSimulados);
        setCampanasPush(campanasSimuladas);
        
        setStats(calculateStats(prospectsSimulados));
        
        // Preparar datos para el gráfico de etapas
        const etapaCount: Record<string, number> = {};
        etapas.forEach(e => etapaCount[e.value] = 0);
        
        prospectsSimulados.forEach(p => {
          if (etapaCount[p.etapa] !== undefined) {
            etapaCount[p.etapa]++;
          } else {
            etapaCount['Nuevo prospecto']++;
          }
        });
        
        const chartData = Object.keys(etapaCount).map((etapa, index) => {
          const colors = ['#9cffba', '#6c7aff', '#ff7eb5', '#ffdd76', '#7ed1ff', '#d9d9d9'];
          return {
            name: etapa,
            value: etapaCount[etapa],
            color: colors[index % colors.length],
            percentage: prospectsSimulados.length ? Math.round((etapaCount[etapa] / prospectsSimulados.length) * 100) : 0
          };
        }).filter(item => item.value > 0);
        
        setEtapasDistribution(chartData);
        setLoading(false);
      }
    }
  }, [authLoading, user]);
  if (authLoading || loading) {
    return (
      <div className="loading-container">
        <Spin size="large">
          <div className="loading-content">Cargando dashboard...</div>
        </Spin>
      </div>
    );
  }
  
  return (
  <div className="dashboard-container">
    <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
      Dashboard {user?.inmobiliaria_id ? `- ${inmobiliariaName || 'Mi Inmobiliaria'}` : '(Modo Demo)'}
    </Title>
    
    
      {/* Fila de tarjetas de estadísticas principales */}
      <Row gutter={[24, 24]}>
        <Col xs={12} sm={6}>
          <StatCard 
            value={stats.total} 
            label="Prospectos" 
            description="Total" 
            type="default" 
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard 
            value={projects.length} 
            label="Proyectos" 
            description="Activos" 
            type="deposited" 
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            value={vendedores.length}
            label="Vendedores"
            description="En equipo"
            type="default"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard 
            value={chats.length} 
            label="Chats" 
            description="Última semana" 
            type="withdrawn" 
          />
        </Col>
      </Row>
      
      {/* Fila de gráfico y prospectos por etapa */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Distribución de Prospectos" bordered={false}>
            <RevenueChart 
              sources={etapasDistribution} 
              timeframe="Este mes" 
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Prospectos por Etapa" bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={etapas.filter(etapa => {
                const count = prospects.filter(p => p.etapa === etapa.value).length;
                return count > 0;
              })}
              renderItem={etapa => {
                const count = prospects.filter(p => p.etapa === etapa.value).length;
                const percentage = Math.round((count / stats.total) * 100) || 0;
                
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Badge 
                          count={count} 
                          style={{ 
                            backgroundColor: etapa.color,
                            marginRight: '8px'
                          }} 
                        />
                      }
                      title={etapa.label}
                      description={`${percentage}% del total`}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Estadísticas de Conversión" bordered={false}>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <Tooltip title="Tasa de conversión (prospectos calificados / total)">
                <Title level={1} style={{ margin: 0 }}>{stats.conversionRate.toFixed(1)}%</Title>
              </Tooltip>
              <Text type="secondary">Tasa de Conversión</Text>
            </div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Tooltip title="Prospectos nuevos en la última semana">
                  <Card size="small">
                    <Statistic 
                      title="Nuevos (semana)" 
                      value={stats.nuevosSemana} 
                      prefix={<RiseOutlined />} 
                    />
                  </Card>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Tiempo promedio hasta decisión final">
                  <Card size="small">
                    <Statistic 
                      title="Días promedio" 
                      value={stats.tiempoPromedio || 0} 
                      suffix="días" 
                      prefix={<CalendarOutlined />} 
                    />
                  </Card>
                </Tooltip>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      {/* Proyectos y vendedores */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><ProjectOutlined /> Proyectos Actuales</>} extra={<a href="#">Ver todos</a>} bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={projects.slice(0, 5)}
              renderItem={project => (
                <List.Item actions={[
                  <Tooltip title="Unidades disponibles">
                    <Tag color="blue">{project.unidades_disponibles || 0} unidades</Tag>
                  </Tooltip>,
                  <Tooltip title="Precio desde">
                    <Tag color="green">${project.precio_desde?.toLocaleString() || 0}</Tag>
                  </Tooltip>
                ]}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={project.imagen_principal || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.nombre)}&background=random`} 
                        shape="square" 
                        size="large"
                      />
                    }
                    title={project.nombre}
                    description={project.descripcion?.substring(0, 60) + '...' || 'Sin descripción'}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<><TeamOutlined /> Equipo de Vendedores</>}
            extra={<a href="/users_admin">Ver todos</a>}
            bordered={false}
          >
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 1,
                lg: 1,
                xl: 1,
              }}
              dataSource={vendedores.slice(0, 3)}
              renderItem={vendedor => (
                <List.Item>
                  <Badge.Ribbon
                    text={vendedor.activo !== false ? 'Activo' : 'Inactivo'}
                    color={vendedor.activo !== false ? 'green' : 'default'}
                  >
                    <Card
                      hoverable
                      size="small"
                      styles={{
                        body: { padding: '16px' }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          size={64}
                          src={vendedor.avatar_url}
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: vendedor.avatar_url ? 'transparent' : '#1890ff',
                            marginRight: '16px'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: '16px', display: 'block' }}>
                            {vendedor.nombre}
                          </Text>
                          <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                            {vendedor.email}
                          </Text>
                          <div>
                            <Tag color="blue" style={{ marginRight: '8px' }}>
                              <TeamOutlined /> {vendedor.prospectos_asignados || 0} prospectos
                            </Tag>
                            <Tag color="green">
                              <TrophyOutlined /> {vendedor.ventas_realizadas || 0} ventas
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Badge.Ribbon>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Chats recientes y campañas push */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><MessageOutlined /> Chats Recientes</>} extra={<a href="#">Ver todos</a>} bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={chats.slice(0, 5)}
              renderItem={chat => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge count={chat.mensajes_count} offset={[0, 5]}>
                        <Avatar icon={<UserOutlined />} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.prospect?.nombre || '')}&background=random`} />
                      </Badge>
                    }
                    title={chat.prospect?.nombre || 'Prospecto'}
                    description={`${new Date(chat.fecha).toLocaleDateString()} - ${chat.mensajes_count} mensajes`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><NotificationOutlined /> Campañas Push</>} extra={<a href="#">Ver todas</a>} bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={campanasPush.slice(0, 5)}
              renderItem={campana => (
                <List.Item actions={[
                  <Tag color={campana.estado === 'Enviada' ? 'green' : (campana.estado === 'Programada' ? 'blue' : 'orange')}>
                    {campana.estado}
                  </Tag>
                ]}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={campana.titulo}
                    description={
                      <>
                        <div>{new Date(campana.fecha_envio).toLocaleDateString()}</div>
                        {campana.destinatarios && (
                          <div>
                            <Tooltip title="Tasa de apertura">
                              <Text type="secondary">
                                <CheckCircleOutlined /> {`${Math.round((campana.aperturas || 0) / campana.destinatarios * 100)}% (${campana.aperturas}/${campana.destinatarios})`}
                              </Text>
                            </Tooltip>
                          </div>
                        )}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Componente auxiliar de estadísticas
const Statistic = ({ title, value, prefix, suffix }: { title: string, value: number, prefix?: React.ReactNode, suffix?: string }) => {
  return (
    <div>
      <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>{title}</div>
      <div style={{ fontSize: '24px', color: 'rgba(0, 0, 0, 0.85)', marginTop: '4px' }}>
        {prefix && <span style={{ marginRight: '8px' }}>{prefix}</span>}
        {value}
        {suffix && <span style={{ marginLeft: '8px', fontSize: '14px' }}>{suffix}</span>}
      </div>
    </div>
  );
};

export default Dashboard;