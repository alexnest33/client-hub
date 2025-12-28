
import React, { useEffect, useRef, useState } from 'react';
import {
  Table,
  Drawer,
  Tag,
  Button,
  Descriptions,
  Select,
  Input,
  DatePicker,
  Row,
  Col,
  Typography,
  message,
  Spin,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import {
  getAllLeads,
  getStats,
  getApplicationById,
  updateApplicationStatus,
} from '../../redux/slices/adminPanelSlice';
import LogoutMenu from '../../components/AdminLogout';
import { EyeOutlined } from '@ant-design/icons';

const STATUS_MAP = { // вынес
  new: { label: 'Новая', color: 'blue' },
  in_progress: { label: 'В работе', color: 'orange' },
  completed: { label: 'Завершена', color: 'green' },
  rejected: { label: 'Отклонена', color: 'red' },
};
const normalizePhone = phone => phone?.replace(/[^\d+]/g, '')
const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const {
    applications,
    pagination,
    stats,
    selectedApplication,
    statusUpdatingId,
    statsLoading,
    tableLoading,
    applicationDetailsLoading,
  } = useSelector((s) => s.adminPanel);

  
  const [filters, setFilters] = useState({ name: '', status: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  
  const [periodRange, setPeriodRange] = useState(null);


  const periodParamsRef = useRef({}); 

  const getPeriodParams = (range) => {
    
    if (!range) return {}; 
    const startIso = range[0].clone().startOf('day').toISOString();
    const endIso = range[1].clone().endOf('day').toISOString();
    return { startDate: startIso, endDate: endIso };
  };

  const syncPeriodRef = (range) => {
    periodParamsRef.current = getPeriodParams(range);
  };

 
  useEffect(() => {
    dispatch(getStats()); 
    dispatch(getAllLeads({ page: 1, limit: pagination.limit }));
    syncPeriodRef(null);

  }, [dispatch]);

  
  const applyRange = (range) => {
  
    const safeRange = range ? [range[0].clone(), range[1].clone()] : null;
    setPeriodRange(safeRange);
    syncPeriodRef(safeRange);

    const periodParams = getPeriodParams(safeRange);
    dispatch(getStats(periodParams));
    dispatch(
      getAllLeads({
        page: 1,
        limit: pagination.limit,
        status: filters.status || undefined,
        ...periodParams,
      })
    );
  };

  const presetRange = (days) => {
    if (!days) {
     
      applyRange(null);
      return;
    }
    
    const start = moment().clone().subtract(days - 1, 'days').startOf('day');
    const end = moment().clone().endOf('day');
    applyRange([start, end]);
  };

  const handleStatusFilterChange = (status) => {
    setFilters((p) => ({ ...p, status }));
    const params = periodParamsRef.current || {};
    dispatch(
      getAllLeads({
        page: 1,
        limit: pagination.limit,
        status: status || undefined,
        ...params,
      })
    );
    dispatch(getStats(params));
  };

  const handleTableChange = (pag) => {
    const params = periodParamsRef.current || {};
    dispatch(
      getAllLeads({
        page: pag.current,
        limit: pag.pageSize,
        status: filters.status || undefined,
        ...params,
      })
    );
  };

  const openDrawer = async (id) => {
    setDrawerOpen(true);
    try {
      await dispatch(getApplicationById(id)).unwrap();
    } catch (err) {
      message.error('Не удалось загрузить подробности заявки');
    }
  };
  const closeDrawer = () => setDrawerOpen(false);

  const handleStatusChange = async (id, oldStatus, newStatus) => {
    if (oldStatus === newStatus) return;
    try {
      await dispatch(updateApplicationStatus({ id, status: newStatus })).unwrap();
      message.success(`Статус обновлён: ${STATUS_MAP[newStatus]?.label || newStatus}`);

      const params = periodParamsRef.current || {};
    
      dispatch(getStats(params));
      const pageToLoad = pagination?.page || 1;
      const pageSize = pagination?.limit || 10;
      dispatch(
        getAllLeads({
          page: pageToLoad,
          limit: pageSize,
          status: filters.status || undefined,
          ...params,
        })
      );

      if (drawerOpen && selectedApplication?.id === id) {
        dispatch(getApplicationById(id));
      }
    } catch (err) {
      console.error('updateApplicationStatus failed:', err);
      message.error(err?.message || 'Не удалось обновить статус');
    }
  };

  
  const filteredApplications = applications.filter((app) =>
    filters.name ? app.name?.toLowerCase().includes(filters.name.toLowerCase()) : true
  );

 
  const columns = [ // вынести 
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Имя', dataIndex: 'name', key: 'name' },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (email ? <a href={`mailto:${email}`}>{email}</a> : '—'),
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (phone ? <a href={`tel:${normalizePhone(phone)}`}>{phone}</a> : '—'),
    },
    { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? moment(date).format('DD.MM.YYYY HH:mm') : '—'),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 160 }}
          loading={statusUpdatingId === record.id}
          disabled={statusUpdatingId === record.id}
          onChange={(value) => handleStatusChange(record.id, status, value)}
          options={Object.entries(STATUS_MAP).map(([key, val]) => ({
            value: key,
            label: <Tag color={val.color} style={{ margin: 0 }}>{val.label}</Tag>,
          }))}
        />
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => openDrawer(record.id)}>
          Детальный просмотр
        </Button>
      ),
    },
  ];

  const renderPeriodLabel = () => {
    if (!periodRange) return <div style={{ color: '#666' }}>Период: <b>За всё время</b></div>;
    return (
      <div style={{ color: '#666' }}>
        Период: <b>{periodRange[0].format('DD.MM.YYYY')}</b> — <b>{periodRange[1].format('DD.MM.YYYY')}</b>
      </div>
    );
  };

  return (
    <>
      <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
      <LogoutMenu />

      <Row gutter={16} style={{ marginBottom: 12, alignItems: 'center' }}>
        <Col>
          <div style={{ marginBottom: 4 }}>Статистика (диапазон)</div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <RangePicker
              onChange={(dates) => applyRange(dates)}
              value={periodRange || undefined}
              format="DD.MM.YYYY"
              placeholder={['От', 'До']}
              allowClear
            />
            <Button onClick={() => presetRange(7)}>7 дней</Button>
            <Button onClick={() => presetRange(30)}>30 дней</Button>
            <Button onClick={() => presetRange(null)}>За всё время</Button>
          </div>
        </Col>

        <Col style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {renderPeriodLabel()}
          {statsLoading ? (
            <Spin size="small" />
          ) : stats ? (
            <>
              <Tag color={STATUS_MAP.new.color}>Новые: {stats.new}</Tag>
              <Tag color={STATUS_MAP.in_progress.color}>В работе: {stats.in_progress}</Tag>
              <Tag color={STATUS_MAP.completed.color}>Завершены: {stats.completed}</Tag>
              <Tag color={STATUS_MAP.rejected.color}>Отклонены: {stats.rejected}</Tag>
              <Tag>Всего: {stats.total}</Tag>
            </>
          ) : (
            <div style={{ color: '#999' }}>Данных нет</div>
          )}
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col>
          <div style={{ marginBottom: 4 }}>Поиск по имени</div>
          <Input placeholder="Введите имя" value={filters.name} onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))} />
        </Col>
        <Col>
          <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
          <Select placeholder="Выберите статус" value={filters.status || undefined} style={{ width: 180 }} allowClear onChange={handleStatusFilterChange}>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <Select.Option key={key} value={key}>{val.label}</Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredApplications}
        rowKey="id"
        pagination={{ current: pagination.page, pageSize: pagination.limit, total: pagination.total }}
        onChange={handleTableChange}
        loading={tableLoading}
      />

      <Drawer title="Детальный просмотр заявки" placement="right" size="small" onClose={closeDrawer} open={drawerOpen}>
        {applicationDetailsLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : selectedApplication ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
            <Descriptions.Item label="Email"><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></Descriptions.Item>
            <Descriptions.Item label="Телефон">{selectedApplication.phone ? <a href={`tel:${normalizePhone(selectedApplication.phone)}`}>{selectedApplication.phone}</a> : '—'}</Descriptions.Item>
            <Descriptions.Item label="Комментарий">{selectedApplication.comment || '—'}</Descriptions.Item>
            <Descriptions.Item label="Статус"><Tag color={STATUS_MAP[selectedApplication.status]?.color}>{STATUS_MAP[selectedApplication.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="UTM Source">{selectedApplication.utm_source || '—'}</Descriptions.Item>
            <Descriptions.Item label="UTM Medium">{selectedApplication.utm_medium || '—'}</Descriptions.Item>
            <Descriptions.Item label="UTM Campaign">{selectedApplication.utm_campaign || '—'}</Descriptions.Item>
            <Descriptions.Item label="IP адрес">{selectedApplication.ip_address}</Descriptions.Item>
            <Descriptions.Item label="User Agent">{selectedApplication.user_agent}</Descriptions.Item>
            <Descriptions.Item label="Создано">{moment(selectedApplication.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="Обновлено">{moment(selectedApplication.updatedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </>
  );
};

export default AdminDashboard;





// import { Table, Drawer, Tag, Button, Descriptions, Select, Input, DatePicker, Row, Col, Typography, message, Spin } from 'antd';
// import { useEffect, useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllLeads, updateApplicationStatus, getApplicationById, getStats } from '../../redux/slices/adminPanelSlice';
// import { EyeOutlined } from '@ant-design/icons';
// import moment from 'moment';
// import LogoutMenu from '../../components/AdminLogout';

// const { Title } = Typography;
// const { RangePicker } = DatePicker;

// const STATUS_MAP = {
//     new: { label: 'Новая', color: 'blue' },
//     in_progress: { label: 'В работе', color: 'orange' },
//     completed: { label: 'Завершена', color: 'green' },
//     rejected: { label: 'Отклонена', color: 'red' },
// };

// const normalizePhone = phone => phone?.replace(/[^\d+]/g, '');

// const DEFAULT_DAYS = 7;

// const AdminDashboard = () => {
//     const dispatch = useDispatch();
//     const { applications, pagination, selectedApplication, stats, statusUpdatingId, applicationDetailsLoading, statsLoading,tableLoading } = useSelector(state => state.adminPanel);

//     const [filters, setFilters] = useState({ name: '', status: '' });
//     const [drawerOpen, setDrawerOpen] = useState(false);

//     // ВАЖНО: используем useRef для currentPeriod, чтобы избежать перерендеров
//     const currentPeriod = useRef({
//         startIso: moment().subtract(6, 'days').startOf('day').toISOString(),
//         endIso: moment().endOf('day').toISOString(),
//     });

//     const openDrawer = async id => {
//         setDrawerOpen(true);
//         await dispatch(getApplicationById(id));
//     };
//     const closeDrawer = () => setDrawerOpen(false);

//     // Рабочий вариант обработчика RangePicker
//     const handleStatsRangeChange = dates => {
//         let startIso, endIso;

//         if (!dates || dates.length !== 2) {
//             // Дефолтные последние 7 дней
//             startIso = moment().subtract(6, 'days').startOf('day').toISOString();
//             endIso = moment().endOf('day').toISOString();
//         } else {
//             startIso = dates[0].startOf('day').toISOString();
//             endIso = dates[1].endOf('day').toISOString();
//         }

//         currentPeriod.current = { startIso, endIso };
//         dispatch(getStats({ startDate: startIso, endDate: endIso }));

//         // Добавляем фильтр по статусу, если он выбран
//         dispatch(getAllLeads({
//             page: 1,
//             limit: pagination.limit,
//             startDate: startIso,
//             endDate: endIso,
//             status: filters.status || undefined
//         }));
//     };

//     // Локальный поиск по имени (сервер не принимает name)
//     const filteredApplications = applications.filter(app =>
//         filters.name ? app.name?.toLowerCase().includes(filters.name.toLowerCase()) : true
//     );

//     const handleStatusChange = async (id, oldStatus, newStatus) => {
//         if (oldStatus === newStatus) return;

//         try {
//             // 1) вызываем thunk и ждём, чтобы убедиться, что сервер успешно применил изменение
//             const result = await dispatch(updateApplicationStatus({ id, status: newStatus })).unwrap();
//             const statusLabel = STATUS_MAP[newStatus]?.label || newStatus;
//             // 2) уведомление об успехе
//             message.success(`Статус обновлён "${statusLabel}"`);

//             // 3) обновляем статистику (только она)
//             dispatch(getStats({
//                 startDate: currentPeriod.current.startIso,
//                 endDate: currentPeriod.current.endIso
//             }));

//             // 4) перезагружаем текущую страницу таблицы, чтобы отобразить актуальные данные сервера
//             //    используем pagination.page (если есть) или 1
//             const pageToLoad = pagination?.page || 1;
//             const pageSize = pagination?.limit || 10;
//             dispatch(getAllLeads({
//                 page: pageToLoad,
//                 limit: pageSize,
//                 startDate: currentPeriod.current.startIso,
//                 endDate: currentPeriod.current.endIso,
//                 status: filters.status || undefined,
//             }));

//             // 5) если открыт Drawer и это та же заявка — обновляем детали
//             if (drawerOpen && selectedApplication?.id === id) {
//                 dispatch(getApplicationById(id));
//             }

//             return result;
//         } catch (err) {
//             const statusLabel = STATUS_MAP[newStatus]?.label || newStatus;
//             message.error(err?.message || `Не удалось обновить статус на "${statusLabel}"`);
//             console.error('updateApplicationStatus failed:', err);
//         }
//     };

//     // При смене фильтра по статусу - сразу серверный запрос + обновление статистики
//     const handleStatusFilterChange = status => {
//         setFilters(prev => ({ ...prev, status }));
//         dispatch(getAllLeads({
//             page: 1,
//             limit: pagination.limit,
//             startDate: currentPeriod.current.startIso,
//             endDate: currentPeriod.current.endIso,
//             status: status || undefined,
//         }));
//         dispatch(getStats({
//             startDate: currentPeriod.current.startIso,
//             endDate: currentPeriod.current.endIso
//         }));
//     };

//     // Пагинация — учитываем период и статус
//     const handleTableChange = (paginationObj) => {
//         dispatch(getAllLeads({
//             page: paginationObj.current,
//             limit: paginationObj.pageSize,
//             startDate: currentPeriod.current.startIso,
//             endDate: currentPeriod.current.endIso,
//             status: filters.status || undefined,
//         }));
//     };

//     // Initial load — последние 7 дней
//     useEffect(() => {
//         dispatch(getStats({
//             startDate: currentPeriod.current.startIso,
//             endDate: currentPeriod.current.endIso
//         }));
//         dispatch(getAllLeads({
//             page: 1,
//             limit: pagination.limit,
//             startDate: currentPeriod.current.startIso,
//             endDate: currentPeriod.current.endIso,
//             status: filters.status || undefined,
//         }));
        
//     }, [dispatch]);

//     const columns = [
//         { title: 'ID', dataIndex: 'id', key: 'id' },
//         { title: 'Имя', dataIndex: 'name', key: 'name' },
//         { title: 'Email', dataIndex: 'email', key: 'email', render: email => email ? <a href={`mailto:${email}`}>{email}</a> : '—' },
//         { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: phone => phone ? <a href={`tel:${normalizePhone(phone)}`}>{phone}</a> : '—' },
//         { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
//         { title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', render: date => date ? moment(date).format('DD.MM.YYYY HH:mm') : '—' },
//         {
//             title: 'Статус', dataIndex: 'status', key: 'status',
//             render: (status, record) => (
//                 <Select
//                     value={status}
//                     style={{ width: 160 }}
//                     loading={statusUpdatingId === record.id}
//                     disabled={statusUpdatingId === record.id}
//                     onChange={value => handleStatusChange(record.id, status, value)}
//                     options={Object.entries(STATUS_MAP).map(([key, val]) => ({
//                         value: key,
//                         label: <Tag color={val.color} style={{ margin: 0 }}>{val.label}</Tag>
//                     }))}
//                 />
//             ),
//         },
//         {
//             title: 'Действия', key: 'actions',
//             render: (_, record) => <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => openDrawer(record.id)}>Детальный просмотр</Button>
//         }
//     ];

//     return (
//         <>
//             <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
//             <LogoutMenu />

//             <Row gutter={16} style={{ marginBottom: 12, alignItems: 'center' }}>
//                 <Col>
//                     <div style={{ marginBottom: 4 }}>Статистика (выберите диапазон)</div>
//                     {/* Ключевое: используем простой RangePicker без value */}
//                     <RangePicker
//                         onChange={handleStatsRangeChange}
//                         format="DD.MM.YYYY"
//                         placeholder={['От', 'До']}
//                         allowClear
//                     />
//                 </Col>

//                 <Col style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                     {statsLoading ? (
//                         <Spin size="small" />
//                     ) : stats ? (
//                         <>
//                             <Tag color={STATUS_MAP.new.color}>Новые: {stats.new}</Tag>
//                             <Tag color={STATUS_MAP.in_progress.color}>В работе: {stats.in_progress}</Tag>
//                             <Tag color={STATUS_MAP.completed.color}>Завершены: {stats.completed}</Tag>
//                             <Tag color={STATUS_MAP.rejected.color}>Отклонены: {stats.rejected}</Tag>
//                             <Tag>Всего: {stats.total}</Tag>
//                         </>
//                     ) : (
//                         <div style={{ color: '#999' }}>Выберите диапазон или подождите...</div>
//                     )}

//                 </Col>
//             </Row>

//             <Row gutter={16} style={{ marginBottom: 20 }}>
//                 <Col>
//                     <div style={{ marginBottom: 4 }}>Поиск по имени</div>
//                     <Input
//                         placeholder="Введите имя"
//                         value={filters.name}
//                         onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
//                     />
//                 </Col>
//                 <Col>
//                     <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
//                     <Select
//                         placeholder="Выберите статус"
//                         value={filters.status || undefined}
//                         style={{ width: 180 }}
//                         allowClear
//                         onChange={handleStatusFilterChange}
//                     >
//                         {Object.entries(STATUS_MAP).map(([key, val]) => (
//                             <Select.Option key={key} value={key}>{val.label}</Select.Option>
//                         ))}
//                     </Select>
//                 </Col>
//             </Row>

//             <Table
//                 columns={columns}
//                 dataSource={filteredApplications}
//                 rowKey="id"
//                 pagination={{ current: pagination.page, pageSize: pagination.limit, total: pagination.total }}
//                 onChange={handleTableChange}
//                 loading={tableLoading}
//             />

//             <Drawer
//                 title="Детальный просмотр заявки"
//                 placement="right"
//                 size="small"
//                 onClose={closeDrawer}
//                 open={drawerOpen}
//             >
//                 {applicationDetailsLoading ? (
//                     <div style={{ padding: 40, textAlign: 'center' }}>
//                         <Spin size="large" />
//                     </div>
//                 ) : selectedApplication ? (
//                     <Descriptions bordered column={1} size="small">
//                         <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
//                         <Descriptions.Item label="Email">
//                             <a href={`mailto:${selectedApplication.email}`}>
//                                 {selectedApplication.email}
//                             </a>
//                         </Descriptions.Item>
//                         <Descriptions.Item label="Телефон">
//                             {selectedApplication.phone
//                                 ? <a href={`tel:${normalizePhone(selectedApplication.phone)}`}>{selectedApplication.phone}</a>
//                                 : '—'}
//                         </Descriptions.Item>
//                         <Descriptions.Item label="Комментарий">
//                             {selectedApplication.comment || '—'}
//                         </Descriptions.Item>
//                         <Descriptions.Item label="Статус">
//                             <Tag color={STATUS_MAP[selectedApplication.status]?.color}>
//                                 {STATUS_MAP[selectedApplication.status]?.label}
//                             </Tag>
//                         </Descriptions.Item>
//                         <Descriptions.Item label="UTM Source">{selectedApplication.utm_source || '—'}</Descriptions.Item>
//                         <Descriptions.Item label="UTM Medium">{selectedApplication.utm_medium || '—'}</Descriptions.Item>
//                         <Descriptions.Item label="UTM Campaign">{selectedApplication.utm_campaign || '—'}</Descriptions.Item>
//                         <Descriptions.Item label="IP адрес">{selectedApplication.ip_address}</Descriptions.Item>
//                         <Descriptions.Item label="User Agent">{selectedApplication.user_agent}</Descriptions.Item>
//                         <Descriptions.Item label="Создано">{moment(selectedApplication.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//                         <Descriptions.Item label="Обновлено">{moment(selectedApplication.updatedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//                         {/* остальное без изменений */}
//                     </Descriptions>
//                 ) : null}
//             </Drawer>

//         </>
//     );
// };

// export default AdminDashboard;