// // >>> AdminDashboard.jsx — обновлённая версия
// import { Table, Drawer, Tag, Button, Descriptions, Select, Input, DatePicker, Row, Col, Typography } from 'antd';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllLeads, updateApplicationStatus, getApplicationById, getStats } from '../../redux/slices/adminPanelSlice';
// import { EyeOutlined } from '@ant-design/icons';
// import moment from 'moment';
// import LogoutMenu from '../../components/AdminLogout';

// const { Title } = Typography;
// const { RangePicker } = DatePicker;

// const AdminDashboard = () => {
//     const dispatch = useDispatch();
//     const { applications, pagination, selectedApplication, stats } = useSelector((state) => state.adminPanel);

//     const [filters, setFilters] = useState({
//         name: '',
//         status: '',
//     });

//     // Храним текущий выбранный период статистики
//     const [statsRange, setStatsRange] = useState(null); // { startDate, endDate } или null

//     const [drawerOpen, setDrawerOpen] = useState(false);

//     const openDrawer = async (id) => {
//         setDrawerOpen(true);
//         await dispatch(getApplicationById(id));
//     };

//     const closeDrawer = () => setDrawerOpen(false);

//     // Обработчик диапазона статистики
//     const handleStatsRangeChange = (dates) => {
//         if (!dates || dates.length !== 2) {
//             // Пользователь нажал крестик → сброс
//             setStatsRange(null);

//             const end = moment().endOf('day').toISOString();
//             const start = moment().subtract(6, 'days').startOf('day').toISOString();

//             dispatch(getStats({ startDate: start, endDate: end }));
//             dispatch(getAllLeads({ page: 1, limit: pagination.limit }));

//             return;
//         }

//         const startDate = dates[0].startOf('day').toISOString();
//         const endDate = dates[1].endOf('day').toISOString();

//         setStatsRange({ startDate, endDate });

//         dispatch(getStats({ startDate, endDate }));
//         dispatch(getAllLeads({ page: 1, limit: pagination.limit, startDate, endDate }));
//     };

//     // Фильтры таблицы только по name/status
//     const filteredApplications = applications.filter(app => {
//         const matchesName = filters.name ? (app.name || '').toLowerCase().includes(filters.name.toLowerCase()) : true;
//         const matchesStatus = filters.status ? app.status === filters.status : true;
//         return matchesName && matchesStatus;
//     });

//     const STATUS_MAP = {
//         new: { label: 'Новая', color: 'blue' },
//         in_progress: { label: 'В работе', color: 'orange' },
//         completed: { label: 'Завершена', color: 'green' },
//         rejected: { label: 'Отклонена', color: 'red' },
//     };

//     const columns = [
//         { title: 'ID', dataIndex: 'id', key: 'id' },
//         { title: 'Имя', dataIndex: 'name', key: 'name' },
//         {
//             title: 'Email', dataIndex: 'email', key: 'email',
//             render: (email) => email ? <a href={`mailto:${email}`}>{email}</a> : '—'
//         },
//         { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
//         { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
//         {
//             title: 'Дата', dataIndex: 'createdAt', key: 'createdAt',
//             render: date => date ? moment(date).format('DD.MM.YYYY HH:mm') : '—'
//         },
//         {
//             title: 'Статус', dataIndex: 'status', key: 'status',
//             render: (status, record) => (
//                 <Select
//                     value={status}
//                     style={{ width: 160 }}
//                     onChange={(value) => {
//                         if (value !== status) {
//                             dispatch(updateApplicationStatus({ id: record.id, status: value }));
//                             if (statsRange) {
//                                 // Обновляем таблицу после смены статуса, чтобы синхронно отобразить statsRange
//                                 dispatch(getAllLeads({ page: 1, limit: pagination.limit, startDate: statsRange.startDate, endDate: statsRange.endDate }));
//                             }
//                         }
//                     }}
//                     options={Object.entries(STATUS_MAP).map(([key, value]) => ({
//                         value: key,
//                         label: <Tag color={value.color} style={{ margin: 0 }}>{value.label}</Tag>
//                     }))}
//                 />
//             ),
//         },
//         {
//             title: 'Действия', key: 'actions',
//             render: (_, record) => (
//                 <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => openDrawer(record.id)}>
//                     Детальный просмотр
//                 </Button>
//             ),
//         }
//     ];

//     const handleTableChange = (p) => {
//         if (statsRange) {
//             dispatch(getAllLeads({
//                 page: p.current,
//                 limit: p.pageSize,
//                 startDate: statsRange.startDate,
//                 endDate: statsRange.endDate,
//             }));
//         } else {
//             dispatch(getAllLeads({ page: p.current, limit: p.pageSize }));
//         }
//     };

//     useEffect(() => {
//         // Инициализация: статистика и заявки за последние 7 дней
//         const end = moment().endOf('day').toISOString();
//         const start = moment().subtract(6, 'days').startOf('day').toISOString();
//         setStatsRange({ startDate: start, endDate: end });

//         dispatch(getStats({ startDate: start, endDate: end }));
//         dispatch(getAllLeads({ page: 1, limit: pagination.limit, startDate: start, endDate: end }));
//     }, [dispatch]);

//     return (
//         <>
//             <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
//             <LogoutMenu />

//             <Row gutter={16} style={{ marginBottom: 12, alignItems: 'center' }}>
//                 <Col>
//                     <div style={{ marginBottom: 4 }}>Статистика (выберите диапазон)</div>
//                     <RangePicker
//                         value={statsRange ? [moment(statsRange.startDate), moment(statsRange.endDate)] : null}
//                         onChange={handleStatsRangeChange}
//                         format="DD.MM.YYYY"
//                         placeholder={['От', 'До']}
//                     />
//                 </Col>
//                 <Col style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                     {stats ? (
//                         <>
//                             <Tag color={STATUS_MAP.new.color}>Новые: {stats.new}</Tag>
//                             <Tag color={STATUS_MAP.in_progress.color}>В работе: {stats.in_progress}</Tag>
//                             <Tag color={STATUS_MAP.completed.color}>Завершены: {stats.completed}</Tag>
//                             <Tag color={STATUS_MAP.rejected.color}>Отклонены: {stats.rejected}</Tag>
//                             <Tag>Всего: {stats.total}</Tag>
//                         </>
//                     ) : (<div style={{ color: '#999' }}>Выберите диапазон или подождите...</div>)}
//                 </Col>
//             </Row>

//             {/* Фильтры таблицы (без даты) */}
//             <Row gutter={16} style={{ marginBottom: 20 }}>
//                 <Col>
//                     <div style={{ marginBottom: 4 }}>Поиск по имени</div>
//                     <Input placeholder="Введите имя" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
//                 </Col>
//                 <Col>
//                     <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
//                     <Select
//                         placeholder="Выберите статус"
//                         value={filters.status || undefined}
//                         style={{ width: 180 }}
//                         allowClear
//                         onChange={value => setFilters({ ...filters, status: value })}
//                     >
//                         {Object.entries(STATUS_MAP).map(([key, value]) =>
//                             <Select.Option key={key} value={key}>{value.label}</Select.Option>
//                         )}
//                     </Select>
//                 </Col>
//             </Row>

//             <Table
//                 columns={columns}
//                 dataSource={filteredApplications}
//                 rowKey="id"
//                 pagination={{
//                     current: pagination.page,
//                     pageSize: pagination.limit,
//                     total: pagination.total,
//                 }}
//                 onChange={handleTableChange}
//             />

//             <Drawer
//                 title="Детальный просмотр заявки"
//                 placement="right"
//                 size="small"
//                 onClose={closeDrawer}
//                 open={drawerOpen}
//             >
//                 {selectedApplication && (
//                     <Descriptions bordered column={1} size="small">
//                         <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
//                         <Descriptions.Item label="Email"><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></Descriptions.Item>
//                         <Descriptions.Item label="Телефон">{selectedApplication.phone}</Descriptions.Item>
//                         <Descriptions.Item label="Комментарий">{selectedApplication.comment || '—'}</Descriptions.Item>
//                         <Descriptions.Item label="Статус">
//                             <Tag color={STATUS_MAP[selectedApplication.status]?.color || 'gray'}>
//                                 {STATUS_MAP[selectedApplication.status]?.label || 'UNKNOWN'}
//                             </Tag>
//                         </Descriptions.Item>
//                         <Descriptions.Item label="UTM Source">{selectedApplication.utm_source || '—'}</Descriptions.Item>
//                         <Descriptions.Item label="UTM Medium">{selectedApplication.utm_medium || '—'}</Descriptions.Item>
//                         <Descriptions.Item label="UTM Campaign">{selectedApplication.utm_campaign || '—'}</Descriptions.Item>
//                         <Descriptions.Item label="IP адрес">{selectedApplication.ip_address}</Descriptions.Item>
//                         <Descriptions.Item label="User Agent">{selectedApplication.user_agent}</Descriptions.Item>
//                         <Descriptions.Item label="Создано">{moment(selectedApplication.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//                         <Descriptions.Item label="Обновлено">{moment(selectedApplication.updatedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//                     </Descriptions>
//                 )}
//             </Drawer>
//         </>
//     );
// };

// export default AdminDashboard;

import { Table, Drawer, Tag, Button, Descriptions, Select, Input, DatePicker, Row, Col, Typography } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeads, updateApplicationStatus, getApplicationById, getStats } from '../../redux/slices/adminPanelSlice';
import { EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import LogoutMenu from '../../components/AdminLogout';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { applications, pagination, selectedApplication, stats } = useSelector(state => state.adminPanel);

  const [filters, setFilters] = useState({ name: '', status: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPeriod = useRef({
    startIso: moment().subtract(6, 'days').startOf('day').toISOString(),
    endIso: moment().endOf('day').toISOString(),
  });

  const openDrawer = async id => {
    setDrawerOpen(true);
    await dispatch(getApplicationById(id));
  };

  const closeDrawer = () => setDrawerOpen(false);

  // Обновляем статистику и заявки за период
  const handleStatsRangeChange = dates => {
    let startIso, endIso;

    if (!dates || dates.length !== 2) {
      // Дефолтные последние 7 дней
      startIso = moment().subtract(6, 'days').startOf('day').toISOString();
      endIso = moment().endOf('day').toISOString();
    } else {
      startIso = dates[0].startOf('day').toISOString();
      endIso = dates[1].endOf('day').toISOString();
    }

    currentPeriod.current = { startIso, endIso };
    dispatch(getStats({ startDate: startIso, endDate: endIso }));
    dispatch(getAllLeads({ page: 1, limit: pagination.limit, startDate: startIso, endDate: endIso }));
  };

  // Фильтруем локально по имени и статусу
  const filteredApplications = applications.filter(app => {
    const matchesName = filters.name ? (app.name || '').toLowerCase().includes(filters.name.toLowerCase()) : true;
    const matchesStatus = filters.status ? app.status === filters.status : true;
    return matchesName && matchesStatus;
  });

  const STATUS_MAP = {
    new: { label: 'Новая', color: 'blue' },
    in_progress: { label: 'В работе', color: 'orange' },
    completed: { label: 'Завершена', color: 'green' },
    rejected: { label: 'Отклонена', color: 'red' },
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Имя', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: email => email ? <a href={`mailto:${email}`}>{email}</a> : '—' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
    { title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', render: date => date ? moment(date).format('DD.MM.YYYY HH:mm') : '—' },
    {
      title: 'Статус', dataIndex: 'status', key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={value => {
            if (value !== status) {
              // Обновляем локально без повторной загрузки списка
              dispatch(updateApplicationStatus({ id: record.id, status: value }));
            }
          }}
          options={Object.entries(STATUS_MAP).map(([key, value]) => ({
            value: key,
            label: <Tag color={value.color} style={{ margin: 0 }}>{value.label}</Tag>
          }))}
        />
      ),
    },
    {
      title: 'Действия', key: 'actions',
      render: (_, record) => <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => openDrawer(record.id)}>Детальный просмотр</Button>
    }
  ];

  // Пагинация с учётом текущего периода
  const handleTableChange = p => {
    const { startIso, endIso } = currentPeriod.current;
    dispatch(getAllLeads({
      page: p.current,
      limit: p.pageSize,
      startDate: startIso,
      endDate: endIso
    }));
  };

  useEffect(() => {
    const { startIso, endIso } = currentPeriod.current;
    dispatch(getStats({ startDate: startIso, endDate: endIso }));
    dispatch(getAllLeads({ page: 1, limit: pagination.limit, startDate: startIso, endDate: endIso }));
  }, [dispatch]);

  return (
    <>
      <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
      <LogoutMenu />

      <Row gutter={16} style={{ marginBottom: 12, alignItems: 'center' }}>
        <Col>
          <div style={{ marginBottom: 4 }}>Статистика (выберите диапазон)</div>
          <RangePicker onChange={handleStatsRangeChange} format="DD.MM.YYYY" placeholder={['От', 'До']} allowClear />
        </Col>

        <Col style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {stats ? (
            <>
              <Tag color={STATUS_MAP.new.color}>Новые: {stats.new}</Tag>
              <Tag color={STATUS_MAP.in_progress.color}>В работе: {stats.in_progress}</Tag>
              <Tag color={STATUS_MAP.completed.color}>Завершены: {stats.completed}</Tag>
              <Tag color={STATUS_MAP.rejected.color}>Отклонены: {stats.rejected}</Tag>
              <Tag>Всего: {stats.total}</Tag>
            </>
          ) : (<div style={{ color: '#999' }}>Выберите диапазон или подождите...</div>)}
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col>
          <div style={{ marginBottom: 4 }}>Поиск по имени</div>
          <Input placeholder="Введите имя" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
        </Col>
        <Col>
          <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
          <Select placeholder="Выберите статус" value={filters.status || undefined} style={{ width: 180 }} allowClear onChange={value => setFilters({ ...filters, status: value })}>
            {Object.entries(STATUS_MAP).map(([key, value]) => <Select.Option key={key} value={key}>{value.label}</Select.Option>)}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredApplications}
        rowKey="id"
        pagination={{ current: pagination.page, pageSize: pagination.limit, total: pagination.total }}
        onChange={handleTableChange}
      />

      <Drawer title="Детальный просмотр заявки" placement="right" size="small" onClose={closeDrawer} open={drawerOpen}>
        {selectedApplication && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
            <Descriptions.Item label="Email"><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></Descriptions.Item>
            <Descriptions.Item label="Телефон">{selectedApplication.phone}</Descriptions.Item>
            <Descriptions.Item label="Комментарий">{selectedApplication.comment || '—'}</Descriptions.Item>
            <Descriptions.Item label="Статус"><Tag color={STATUS_MAP[selectedApplication.status]?.color || 'gray'}>{STATUS_MAP[selectedApplication.status]?.label || 'UNKNOWN'}</Tag></Descriptions.Item>
            <Descriptions.Item label="UTM Source">{selectedApplication.utm_source || '—'}</Descriptions.Item>
            <Descriptions.Item label="UTM Medium">{selectedApplication.utm_medium || '—'}</Descriptions.Item>
            <Descriptions.Item label="UTM Campaign">{selectedApplication.utm_campaign || '—'}</Descriptions.Item>
            <Descriptions.Item label="IP адрес">{selectedApplication.ip_address}</Descriptions.Item>
            <Descriptions.Item label="User Agent">{selectedApplication.user_agent}</Descriptions.Item>
            <Descriptions.Item label="Создано">{moment(selectedApplication.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="Обновлено">{moment(selectedApplication.updatedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default AdminDashboard;

