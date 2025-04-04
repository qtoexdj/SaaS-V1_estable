import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Table,
  Tag,
  Button,
  Select,
  Typography,
  Grid,
  theme,
  message,
  Tooltip,
} from 'antd';
import { DragableKanban } from '../components/DragableKanban';
import {
  UserOutlined,
  FunnelPlotOutlined,
  WhatsAppOutlined,
  FireOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

const { Text } = Typography;
const { useBreakpoint } = Grid;

// Interfaces
interface Prospect {
  id: string;
  nombre: string;
  etapa: string;
  numero_whatsapp: string;
  proyecto_interesado: string;
  fecha_proximo_seguimiento: string;
  cantidad_seguimientos: number;
  inmobiliaria_id: string;
  inmobiliaria?: {
    nombre: string;
  };
  created_at: string;
  updated_at: string;
}

interface GlobalStats {
  total: number;
  activos: number;
  nuevosSemana: number;
  conversionRate: number;
  tiempoPromedio: number;
}

interface InmobiliariaStats {
  id: string;
  nombre: string;
  total: number;
  conversion: number;
  activos: number;
}

// Configuración de etapas
const etapas = [
  { value: 'Nuevo prospecto', color: 'green', icon: '🆕' },
  { value: 'Conversación', color: 'orange', icon: '💬' },
  { value: 'Calificado', color: 'blue', icon: '✅' },
  { value: 'No calificado', color: 'red', icon: '❌' },
  { value: 'Agendado', color: 'purple', icon: '📅' },
  { value: 'No interesado', color: 'gray', icon: '⛔' },
];

const Prospects_dev: React.FC = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    total: 0,
    activos: 0,
    nuevosSemana: 0,
    conversionRate: 0,
    tiempoPromedio: 0,
  });
  const [inmobiliariasStats, setInmobiliariasStats] = useState<InmobiliariaStats[]>([]);
  const [selectedInmobiliaria, setSelectedInmobiliaria] = useState<string | null>(null);
  const [selectedEtapa, setSelectedEtapa] = useState<string | null>(null);

  // Hooks
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const { role } = useAuth();

  // Verificar rol dev
  useEffect(() => {
    if (role !== 'dev') {
      message.error('No tienes permiso para acceder a esta página');
      // Aquí podrías redirigir a una página de error o al dashboard
    }
  }, [role]);

  // Cargar datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Consulta principal de prospectos
      let query = supabase
        .from('prospectos')
        .select(`
          *,
          inmobiliaria:inmobiliarias (
            id,
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros si existen
      if (selectedInmobiliaria) {
        query = query.eq('inmobiliaria_id', selectedInmobiliaria);
      }
      if (selectedEtapa) {
        query = query.eq('etapa', selectedEtapa);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProspects(data || []);

      // Calcular estadísticas globales
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        total: data?.length || 0,
        activos: data?.filter(p => p.etapa !== 'No interesado').length || 0,
        nuevosSemana: data?.filter(p => new Date(p.created_at) > oneWeekAgo).length || 0,
        conversionRate: calculateConversionRate(data || []),
        tiempoPromedio: calculateAverageTime(data || []),
      };

      setGlobalStats(stats);

      // Calcular estadísticas por inmobiliaria
      const inmobiliariasMap = new Map<string, InmobiliariaStats>();
      data?.forEach(prospect => {
        const inmobiliariaId = prospect.inmobiliaria_id;
        const stats = inmobiliariasMap.get(inmobiliariaId) || {
          id: inmobiliariaId,
          nombre: prospect.inmobiliaria?.nombre || '',
          total: 0,
          conversion: 0,
          activos: 0,
        };

        stats.total++;
        if (prospect.etapa !== 'No interesado') {
          stats.activos++;
        }
        if (prospect.etapa === 'Calificado') {
          stats.conversion++;
        }

        inmobiliariasMap.set(inmobiliariaId, stats);
      });

      setInmobiliariasStats(Array.from(inmobiliariasMap.values()));
    } catch (error) {
      console.error('Error fetching prospects:', error);
      message.error('Error al cargar los prospectos');
    } finally {
      setLoading(false);
    }
  }, [selectedInmobiliaria, selectedEtapa]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Funciones auxiliares
  const calculateConversionRate = (prospects: Prospect[]): number => {
    const calificados = prospects.filter(p => p.etapa === 'Calificado').length;
    return prospects.length > 0 ? (calificados / prospects.length) * 100 : 0;
  };

  const calculateAverageTime = (prospects: Prospect[]): number => {
    const completedProspects = prospects.filter(p => 
      p.etapa === 'Calificado' || p.etapa === 'No interesado'
    );

    if (completedProspects.length === 0) return 0;

    const totalTime = completedProspects.reduce((acc, prospect) => {
      const start = new Date(prospect.created_at);
      const end = new Date(prospect.updated_at);
      return acc + (end.getTime() - start.getTime());
    }, 0);

    return Math.round(totalTime / completedProspects.length / (1000 * 60 * 60 * 24)); // días
  };

  return (
    <div style={{ padding: token.padding }}>
      {/* Dashboard Header */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6}>
            <Statistic
              title="Total Prospectos"
              value={globalStats.total}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} lg={6}>
            <Statistic
              title="Tasa de Conversión"
              value={globalStats.conversionRate}
              precision={2}
              suffix="%"
              prefix={<FunnelPlotOutlined />}
            />
          </Col>
          <Col xs={24} lg={6}>
            <Statistic
              title="Nuevos esta Semana"
              value={globalStats.nuevosSemana}
              prefix={<FireOutlined />}
            />
          </Col>
          <Col xs={24} lg={6}>
            <Statistic
              title="Tiempo Promedio (días)"
              value={globalStats.tiempoPromedio}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Filtros y Controles */}
      <Card style={{ marginTop: 16 }}>
        <Space direction={screens.xs ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
          <Select
            style={{ width: 200 }}
            placeholder="Filtrar por Inmobiliaria"
            allowClear
            onChange={value => setSelectedInmobiliaria(value)}
          >
            {inmobiliariasStats.map(inmobiliaria => (
              <Select.Option key={inmobiliaria.id} value={inmobiliaria.id}>
                {inmobiliaria.nombre}
              </Select.Option>
            ))}
          </Select>
          <Select
            style={{ width: 200 }}
            placeholder="Filtrar por Etapa"
            allowClear
            onChange={value => setSelectedEtapa(value)}
          >
            {etapas.map(etapa => (
              <Select.Option key={etapa.value} value={etapa.value}>
                {etapa.icon} {etapa.value}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Vista Kanban */}
      <Card style={{ marginTop: 16, overflow: 'hidden' }}>
        <DragableKanban
          prospects={prospects}
          onDragEnd={async (result) => {
            if (!result.destination || result.source.droppableId === result.destination.droppableId) {
              return;
            }

            try {
              const prospectId = result.draggableId;
              const newEtapa = result.destination.droppableId;

              // Actualizar en la base de datos
              const { error } = await supabase
                .from('prospectos')
                .update({
                  etapa: newEtapa,
                  updated_at: new Date().toISOString()
                })
                .eq('id', prospectId);

              if (error) throw error;

              // Actualizar estado local
              setProspects(prospects.map(prospect =>
                prospect.id === prospectId
                  ? { ...prospect, etapa: newEtapa }
                  : prospect
              ));

              message.success('Prospecto actualizado correctamente');
            } catch (error) {
              console.error('Error al actualizar prospecto:', error);
              message.error('Error al actualizar el prospecto');
            }
          }}
        />
      </Card>

      {/* Vista de Tabla */}
      <Card style={{ marginTop: 16 }}>
        <Table<Prospect>
          loading={loading}
          dataSource={prospects}
          rowKey="id"
          columns={[
            {
              title: 'Inmobiliaria',
              dataIndex: ['inmobiliaria', 'nombre'],
              key: 'inmobiliaria',
              filters: inmobiliariasStats.map(i => ({
                text: i.nombre,
                value: i.id,
              })),
              onFilter: (value, record) => record.inmobiliaria_id === value,
            },
            {
              title: 'Nombre',
              dataIndex: 'nombre',
              key: 'nombre',
              render: (text, record) => (
                <Space>
                  <Text>{text}</Text>
                  <Tooltip title="Contactar por WhatsApp">
                    <Button
                      type="link"
                      icon={<WhatsAppOutlined />}
                      onClick={() => window.open(`https://wa.me/${record.numero_whatsapp}`, '_blank')}
                    />
                  </Tooltip>
                </Space>
              ),
            },
            {
              title: 'Etapa',
              dataIndex: 'etapa',
              key: 'etapa',
              render: (etapa: string) => {
                const etapaConfig = etapas.find(e => e.value === etapa);
                return (
                  <Tag color={etapaConfig?.color}>
                    {etapaConfig?.icon} {etapa}
                  </Tag>
                );
              },
              filters: etapas.map(e => ({
                text: `${e.icon} ${e.value}`,
                value: e.value,
              })),
              onFilter: (value, record) => record.etapa === value,
            },
            {
              title: 'Proyecto',
              dataIndex: 'proyecto_interesado',
              key: 'proyecto',
            },
            {
              title: 'Seguimientos',
              dataIndex: 'cantidad_seguimientos',
              key: 'seguimientos',
              sorter: (a, b) => a.cantidad_seguimientos - b.cantidad_seguimientos,
            },
            {
              title: 'Próximo Seguimiento',
              dataIndex: 'fecha_proximo_seguimiento',
              key: 'proximo_seguimiento',
              render: (date: string) => new Date(date).toLocaleDateString(),
              sorter: (a, b) => 
                new Date(a.fecha_proximo_seguimiento).getTime() - 
                new Date(b.fecha_proximo_seguimiento).getTime(),
            },
          ]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} prospectos`,
          }}
        />
      </Card>
    </div>
  );
};

export default Prospects_dev;