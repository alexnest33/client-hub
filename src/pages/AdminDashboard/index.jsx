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

// import { Table, Drawer, Tag, Button, Descriptions, Select, Input, DatePicker, Row, Col, Typography } from 'antd';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllLeads, updateApplicationStatus, getApplicationById, getStats } from '../../redux/slices/adminPanelSlice';
// import { EyeOutlined } from '@ant-design/icons';
// import moment from 'moment';
// import LogoutMenu from '../../components/AdminLogout';

// const { Title } = Typography;
// const { RangePicker } = DatePicker;

// const STATUS_MAP = {
//   new: { label: 'Новая', color: 'blue' },
//   in_progress: { label: 'В работе', color: 'orange' },
//   completed: { label: 'Завершена', color: 'green' },
//   rejected: { label: 'Отклонена', color: 'red' },
// };

// const normalizePhone = phone => phone?.replace(/[^\d+]/g, '');

// const DEFAULT_DAYS = 7;

// const AdminDashboard = () => {
//   const dispatch = useDispatch();
//   const { applications, pagination, selectedApplication, stats } = useSelector(state => state.adminPanel);

//   const [filters, setFilters] = useState({ name: '', status: '' });
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [currentPeriod, setCurrentPeriod] = useState({
//     startIso: moment().subtract(DEFAULT_DAYS - 1, 'days').startOf('day').toISOString(),
//     endIso: moment().endOf('day').toISOString(),
//   });

//   const openDrawer = async id => {
//     setDrawerOpen(true);
//     await dispatch(getApplicationById(id));
//   };
//   const closeDrawer = () => setDrawerOpen(false);

//   // Обновляем период и статистику
//   const handleStatsRangeChange = dates => {
//     let startIso, endIso;
//     if (!dates || dates.length !== 2) {
//       startIso = moment().subtract(DEFAULT_DAYS - 1, 'days').startOf('day').toISOString();
//       endIso = moment().endOf('day').toISOString();
//     } else {
//       startIso = dates[0].startOf('day').toISOString();
//       endIso = dates[1].endOf('day').toISOString();
//     }
//     setCurrentPeriod({ startIso, endIso });
//     dispatch(getStats({ startDate: startIso, endDate: endIso }));
//     dispatch(getAllLeads({
//       page: 1,
//       limit: pagination.limit,
//       startDate: startIso,
//       endDate: endIso,
//       status: filters.status || undefined
//     }));
//   };

//   // Локальный поиск по имени
//   const filteredApplications = applications.filter(app =>
//     filters.name ? app.name?.toLowerCase().includes(filters.name.toLowerCase()) : true
//   );

//   // Смена статуса заявки
//   const handleStatusChange = async (id, oldStatus, newStatus) => {
//     if (oldStatus === newStatus) return;
//     await dispatch(updateApplicationStatus({ id, status: newStatus }));
//     dispatch(getStats({ startDate: currentPeriod.startIso, endDate: currentPeriod.endIso }));
//   };

//   // Фильтр по статусу
//   const handleStatusFilterChange = status => {
//     setFilters(prev => ({ ...prev, status }));
//     dispatch(getAllLeads({
//       page: 1,
//       limit: pagination.limit,
//       startDate: currentPeriod.startIso,
//       endDate: currentPeriod.endIso,
//       status: status || undefined
//     }));
//     dispatch(getStats({ startDate: currentPeriod.startIso, endDate: currentPeriod.endIso }));
//   };

//   // Пагинация
//   const handleTableChange = p => {
//     dispatch(getAllLeads({
//       page: p.current,
//       limit: p.pageSize,
//       startDate: currentPeriod.startIso,
//       endDate: currentPeriod.endIso,
//       status: filters.status || undefined
//     }));
//   };

//   useEffect(() => {
//     // при монтировании загружаем последние 7 дней
//     dispatch(getStats({ startDate: currentPeriod.startIso, endDate: currentPeriod.endIso }));
//     dispatch(getAllLeads({
//       page: 1,
//       limit: pagination.limit,
//       startDate: currentPeriod.startIso,
//       endDate: currentPeriod.endIso,
//       status: filters.status || undefined
//     }));
//   }, [dispatch]);

//   const columns = [
//     { title: 'ID', dataIndex: 'id', key: 'id' },
//     { title: 'Имя', dataIndex: 'name', key: 'name' },
//     { title: 'Email', dataIndex: 'email', key: 'email', render: email => email ? <a href={`mailto:${email}`}>{email}</a> : '—' },
//     { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: phone => phone ? <a href={`tel:${normalizePhone(phone)}`}>{phone}</a> : '—' },
//     { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
//     { title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', render: date => date ? moment(date).format('DD.MM.YYYY HH:mm') : '—' },
//     {
//       title: 'Статус', dataIndex: 'status', key: 'status',
//       render: (status, record) => (
//         <Select
//           value={status}
//           style={{ width: 160 }}
//           onChange={value => handleStatusChange(record.id, status, value)}
//           options={Object.entries(STATUS_MAP).map(([key, val]) => ({
//             value: key,
//             label: <Tag color={val.color} style={{ margin: 0 }}>{val.label}</Tag>
//           }))}
//         />
//       ),
//     },
//     {
//       title: 'Действия', key: 'actions',
//       render: (_, record) => <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => openDrawer(record.id)}>Детальный просмотр</Button>
//     }
//   ];

//   return (
//     <>
//       <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
//       <LogoutMenu />

//       <Row gutter={16} style={{ marginBottom: 12, alignItems: 'center' }}>
//         <Col>
//           <div style={{ marginBottom: 4 }}>Статистика (выберите диапазон)</div>
//           <RangePicker
//             onChange={handleStatsRangeChange}
//             format="DD.MM.YYYY"
//             placeholder={['От', 'До']}
//             allowClear
//             defaultValue={[moment(currentPeriod.startIso), moment(currentPeriod.endIso)]}
//           />
//         </Col>

//         <Col style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//           {stats ? (
//             <>
//               <Tag color={STATUS_MAP.new.color}>Новые: {stats.new}</Tag>
//               <Tag color={STATUS_MAP.in_progress.color}>В работе: {stats.in_progress}</Tag>
//               <Tag color={STATUS_MAP.completed.color}>Завершены: {stats.completed}</Tag>
//               <Tag color={STATUS_MAP.rejected.color}>Отклонены: {stats.rejected}</Tag>
//               <Tag>Всего: {stats.total}</Tag>
//             </>
//           ) : (<div style={{ color: '#999' }}>Выберите диапазон или подождите...</div>)}
//         </Col>
//       </Row>

//       <Row gutter={16} style={{ marginBottom: 20 }}>
//         <Col>
//           <div style={{ marginBottom: 4 }}>Поиск по имени</div>
//           <Input
//             placeholder="Введите имя"
//             value={filters.name}
//             onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
//           />
//         </Col>
//         <Col>
//           <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
//           <Select
//             placeholder="Выберите статус"
//             value={filters.status || undefined}
//             style={{ width: 180 }}
//             allowClear
//             onChange={handleStatusFilterChange}
//           >
//             {Object.entries(STATUS_MAP).map(([key, val]) => (
//               <Select.Option key={key} value={key}>{val.label}</Select.Option>
//             ))}
//           </Select>
//         </Col>
//       </Row>

//       <Table
//         columns={columns}
//         dataSource={filteredApplications}
//         rowKey="id"
//         pagination={{ current: pagination.page, pageSize: pagination.limit, total: pagination.total }}
//         onChange={handleTableChange}
//       />

//       <Drawer title="Детальный просмотр заявки" placement="right" size="small" onClose={closeDrawer} open={drawerOpen}>
//         {selectedApplication && (
//           <Descriptions bordered column={1} size="small">
//             <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
//             <Descriptions.Item label="Email"><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></Descriptions.Item>
//             <Descriptions.Item label="Телефон">{selectedApplication.phone ? <a href={`tel:${normalizePhone(selectedApplication.phone)}`}>{selectedApplication.phone}</a> : '—'}</Descriptions.Item>
//             <Descriptions.Item label="Комментарий">{selectedApplication.comment || '—'}</Descriptions.Item>
//             <Descriptions.Item label="Статус"><Tag color={STATUS_MAP[selectedApplication.status]?.color || 'gray'}>{STATUS_MAP[selectedApplication.status]?.label || 'UNKNOWN'}</Tag></Descriptions.Item>
//             <Descriptions.Item label="UTM Source">{selectedApplication.utm_source || '—'}</Descriptions.Item>
//             <Descriptions.Item label="UTM Medium">{selectedApplication.utm_medium || '—'}</Descriptions.Item>
//             <Descriptions.Item label="UTM Campaign">{selectedApplication.utm_campaign || '—'}</Descriptions.Item>
//             <Descriptions.Item label="IP адрес">{selectedApplication.ip_address}</Descriptions.Item>
//             <Descriptions.Item label="User Agent">{selectedApplication.user_agent}</Descriptions.Item>
//             <Descriptions.Item label="Создано">{moment(selectedApplication.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//             <Descriptions.Item label="Обновлено">{moment(selectedApplication.updatedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//           </Descriptions>
//         )}
//       </Drawer>
//     </>
//   );
// };

// export default AdminDashboard;


// import { Table, Drawer, Tag, Button, Descriptions, Select, Input, DatePicker, Row, Col, Typography, message } from 'antd';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllLeads, updateApplicationStatus, getApplicationById, getStats } from '../../redux/slices/adminPanelSlice';
// import { EyeOutlined } from '@ant-design/icons';
// import moment from 'moment';
// import LogoutMenu from '../../components/AdminLogout';

// const { Title } = Typography;
// const { RangePicker } = DatePicker;

// const STATUS_MAP = {
//   new: { label: 'Новая', color: 'blue' },
//   in_progress: { label: 'В работе', color: 'orange' },
//   completed: { label: 'Завершена', color: 'green' },
//   rejected: { label: 'Отклонена', color: 'red' },
// };

// const normalizePhone = phone => phone?.replace(/[^\d+]/g, '');

// const DEFAULT_DAYS = 7;

// const AdminDashboard = () => {
//   const dispatch = useDispatch();
//   const { applications, pagination, selectedApplication, stats } = useSelector(state => state.adminPanel);

//   const [filters, setFilters] = useState({ name: '', status: '' });
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   // CHANGE: useState вместо useRef — реактивное хранение периода
//   const [currentPeriod, setCurrentPeriod] = useState({
//     startIso: moment().subtract(DEFAULT_DAYS - 1, 'days').startOf('day').toISOString(),
//     endIso: moment().endOf('day').toISOString(),
//   });

//   const openDrawer = async id => {
//     setDrawerOpen(true);
//     await dispatch(getApplicationById(id));
//   };
//   const closeDrawer = () => setDrawerOpen(false);

//   // CHANGE: исправленный обработчик для RangePicker
//   const handleStatsRangeChange = dates => {
//     if (!dates || dates.length !== 2) {
//       // Если даты очищены, устанавливаем период по умолчанию
//       const startIso = moment().subtract(DEFAULT_DAYS - 1, 'days').startOf('day').toISOString();
//       const endIso = moment().endOf('day').toISOString();
//       setCurrentPeriod({ startIso, endIso });
//       dispatch(getStats({ startDate: startIso, endDate: endIso }));
//       dispatch(getAllLeads({
//         page: 1,
//         limit: pagination.limit,
//         startDate: startIso,
//         endDate: endIso,
//         status: filters.status || undefined,
//       }));
//     } else {
//       // Используем dates[0] и dates[1] напрямую
//       const startIso = dates[0].startOf('day').toISOString();
//       const endIso = dates[1].endOf('day').toISOString();
//       setCurrentPeriod({ startIso, endIso });
//       dispatch(getStats({ startDate: startIso, endDate: endIso }));
//       dispatch(getAllLeads({
//         page: 1,
//         limit: pagination.limit,
//         startDate: startIso,
//         endDate: endIso,
//         status: filters.status || undefined,
//       }));
//     }
//   };

//   // Локальный поиск по имени (сервер не принимает name)
//   const filteredApplications = applications.filter(app =>
//     filters.name ? app.name?.toLowerCase().includes(filters.name.toLowerCase()) : true
//   );

//   /**
//    * CHANGE: handleStatusChange — теперь:
//    *  1) вызывает updateApplicationStatus (thunk) и ждёт результата (unwrap)
//    *  2) показывает сообщение об успехе/ошибке
//    *  3) обновляет статистику для currentPeriod
//    *  4) перезагружает текущую страницу таблицы (getAllLeads)
//    *  5) если открыт Drawer для этой заявки — обновляет его (getApplicationById)
//    */
//   const handleStatusChange = async (id, oldStatus, newStatus) => {
//     if (oldStatus === newStatus) return;

//     try {
//       // 1) вызываем thunk и ждём, чтобы убедиться, что сервер успешно применил изменение
//       const result = await dispatch(updateApplicationStatus({ id, status: newStatus })).unwrap();

//       // 2) уведомление об успехе
//       message.success('Статус обновлён');

//       // 3) обновляем статистику (только она)
//       dispatch(getStats({ startDate: currentPeriod.startIso, endDate: currentPeriod.endIso }));

//       // 4) перезагружаем текущую страницу таблицы, чтобы отобразить актуальные данные сервера
//       //    используем pagination.page (если есть) или 1
//       const pageToLoad = pagination?.page || 1;
//       const pageSize = pagination?.limit || 10;
//       dispatch(getAllLeads({
//         page: pageToLoad,
//         limit: pageSize,
//         startDate: currentPeriod.startIso,
//         endDate: currentPeriod.endIso,
//         status: filters.status || undefined,
//       }));

//       // 5) если открыт Drawer и это та же заявка — обновляем детали
//       if (drawerOpen && selectedApplication?.id === id) {
//         dispatch(getApplicationById(id));
//       }

//       // Дополнительно: если твой reducer не обновляет applications автоматически,
//       // можно локально обновить state в сторе (но лучше делать это в slice)
//       return result;
//     } catch (err) {
//       // Если unwrap бросил ошибку
//       message.error(err?.message || 'Не удалось обновить статус');
//       console.error('updateApplicationStatus failed:', err);
//     }
//   };

//   // CHANGE: при смене фильтра по статусу - сразу серверный запрос + обновление статистики
//   const handleStatusFilterChange = status => {
//     setFilters(prev => ({ ...prev, status }));
//     dispatch(getAllLeads({
//       page: 1,
//       limit: pagination.limit,
//       startDate: currentPeriod.startIso,
//       endDate: currentPeriod.endIso,
//       status: status || undefined,
//     }));
//     dispatch(getStats({ startDate: currentPeriod.startIso, endDate: currentPeriod.endIso }));
//   };

//   // Пагинация — учитываем период и статус
//   const handleTableChange = (paginationObj) => {
//     dispatch(getAllLeads({
//       page: paginationObj.current,
//       limit: paginationObj.pageSize,
//       startDate: currentPeriod.startIso,
//       endDate: currentPeriod.endIso,
//       status: filters.status || undefined,
//     }));
//   };

//   // Initial load — последние 7 дней
//   useEffect(() => {
//     dispatch(getStats({ startDate: currentPeriod.startIso, endDate: currentPeriod.endIso }));
//     dispatch(getAllLeads({
//       page: 1,
//       limit: pagination.limit,
//       startDate: currentPeriod.startIso,
//       endDate: currentPeriod.endIso,
//       status: filters.status || undefined,
//     }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dispatch]);

//   const columns = [
//     { title: 'ID', dataIndex: 'id', key: 'id' },
//     { title: 'Имя', dataIndex: 'name', key: 'name' },
//     { title: 'Email', dataIndex: 'email', key: 'email', render: email => email ? <a href={`mailto:${email}`}>{email}</a> : '—' },
//     { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: phone => phone ? <a href={`tel:${normalizePhone(phone)}`}>{phone}</a> : '—' },
//     { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
//     { title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', render: date => date ? moment(date).format('DD.MM.YYYY HH:mm') : '—' },
//     {
//       title: 'Статус', dataIndex: 'status', key: 'status',
//       render: (status, record) => (
//         <Select
//           value={status}
//           style={{ width: 160 }}
//           onChange={value => handleStatusChange(record.id, status, value)}
//           options={Object.entries(STATUS_MAP).map(([key, val]) => ({
//             value: key,
//             label: <Tag color={val.color} style={{ margin: 0 }}>{val.label}</Tag>
//           }))}
//         />
//       ),
//     },
//     {
//       title: 'Действия', key: 'actions',
//       render: (_, record) => <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => openDrawer(record.id)}>Детальный просмотр</Button>
//     }
//   ];

//   return (
//     <>
//       <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
//       <LogoutMenu />

//       <Row gutter={16} style={{ marginBottom: 12, alignItems: 'center' }}>
//         <Col>
//           <div style={{ marginBottom: 4 }}>Статистика (выберите диапазон)</div>
//           <RangePicker
//             onChange={handleStatsRangeChange}
//             format="DD.MM.YYYY"
//             placeholder={['От', 'До']}
//             allowClear
//             // Исправлено: проверяем наличие дат перед созданием moment объектов
//             value={currentPeriod.startIso && currentPeriod.endIso ? [
//               moment(currentPeriod.startIso),
//               moment(currentPeriod.endIso)
//             ] : null}
//           />
//         </Col>

//         <Col style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//           {stats ? (
//             <>
//               <Tag color={STATUS_MAP.new.color}>Новые: {stats.new}</Tag>
//               <Tag color={STATUS_MAP.in_progress.color}>В работе: {stats.in_progress}</Tag>
//               <Tag color={STATUS_MAP.completed.color}>Завершены: {stats.completed}</Tag>
//               <Tag color={STATUS_MAP.rejected.color}>Отклонены: {stats.rejected}</Tag>
//               <Tag>Всего: {stats.total}</Tag>
//             </>
//           ) : (<div style={{ color: '#999' }}>Выберите диапазон или подождите...</div>)}
//         </Col>
//       </Row>

//       <Row gutter={16} style={{ marginBottom: 20 }}>
//         <Col>
//           <div style={{ marginBottom: 4 }}>Поиск по имени</div>
//           <Input
//             placeholder="Введите имя"
//             value={filters.name}
//             onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
//           />
//         </Col>
//         <Col>
//           <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
//           <Select
//             placeholder="Выберите статус"
//             value={filters.status || undefined}
//             style={{ width: 180 }}
//             allowClear
//             onChange={handleStatusFilterChange}
//           >
//             {Object.entries(STATUS_MAP).map(([key, val]) => (
//               <Select.Option key={key} value={key}>{val.label}</Select.Option>
//             ))}
//           </Select>
//         </Col>
//       </Row>

//       <Table
//         columns={columns}
//         dataSource={filteredApplications}
//         rowKey="id"
//         pagination={{ current: pagination.page, pageSize: pagination.limit, total: pagination.total }}
//         onChange={handleTableChange}
//       />

//       <Drawer title="Детальный просмотр заявки" placement="right" size="small" onClose={closeDrawer} open={drawerOpen}>
//         {selectedApplication && (
//           <Descriptions bordered column={1} size="small">
//             <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
//             <Descriptions.Item label="Email"><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></Descriptions.Item>
//             <Descriptions.Item label="Телефон">{selectedApplication.phone ? <a href={`tel:${normalizePhone(selectedApplication.phone)}`}>{selectedApplication.phone}</a> : '—'}</Descriptions.Item>
//             <Descriptions.Item label="Комментарий">{selectedApplication.comment || '—'}</Descriptions.Item>
//             <Descriptions.Item label="Статус"><Tag color={STATUS_MAP[selectedApplication.status]?.color || 'gray'}>{STATUS_MAP[selectedApplication.status]?.label || 'UNKNOWN'}</Tag></Descriptions.Item>
//             <Descriptions.Item label="UTM Source">{selectedApplication.utm_source || '—'}</Descriptions.Item>
//             <Descriptions.Item label="UTM Medium">{selectedApplication.utm_medium || '—'}</Descriptions.Item>
//             <Descriptions.Item label="UTM Campaign">{selectedApplication.utm_campaign || '—'}</Descriptions.Item>
//             <Descriptions.Item label="IP адрес">{selectedApplication.ip_address}</Descriptions.Item>
//             <Descriptions.Item label="User Agent">{selectedApplication.user_agent}</Descriptions.Item>
//             <Descriptions.Item label="Создано">{moment(selectedApplication.createdAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//             <Descriptions.Item label="Обновлено">{moment(selectedApplication.updatedAt).format('DD.MM.YYYY HH:mm')}</Descriptions.Item>
//           </Descriptions>
//         )}
//       </Drawer>
//     </>
//   );
// };

// export default AdminDashboard;


import { Table, Drawer, Tag, Button, Descriptions, Select, Input, DatePicker, Row, Col, Typography, message } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeads, updateApplicationStatus, getApplicationById, getStats } from '../../redux/slices/adminPanelSlice';
import { EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import LogoutMenu from '../../components/AdminLogout';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const STATUS_MAP = {
  new: { label: 'Новая', color: 'blue' },
  in_progress: { label: 'В работе', color: 'orange' },
  completed: { label: 'Завершена', color: 'green' },
  rejected: { label: 'Отклонена', color: 'red' },
};

const normalizePhone = phone => phone?.replace(/[^\d+]/g, '');

const DEFAULT_DAYS = 7;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { applications, pagination, selectedApplication, stats } = useSelector(state => state.adminPanel);

  const [filters, setFilters] = useState({ name: '', status: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // ВАЖНО: используем useRef для currentPeriod, чтобы избежать перерендеров
  const currentPeriod = useRef({
    startIso: moment().subtract(6, 'days').startOf('day').toISOString(),
    endIso: moment().endOf('day').toISOString(),
  });

  const openDrawer = async id => {
    setDrawerOpen(true);
    await dispatch(getApplicationById(id));
  };
  const closeDrawer = () => setDrawerOpen(false);

  // Рабочий вариант обработчика RangePicker
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
    
    // Добавляем фильтр по статусу, если он выбран
    dispatch(getAllLeads({ 
      page: 1, 
      limit: pagination.limit, 
      startDate: startIso, 
      endDate: endIso,
      status: filters.status || undefined 
    }));
  };

  // Локальный поиск по имени (сервер не принимает name)
  const filteredApplications = applications.filter(app =>
    filters.name ? app.name?.toLowerCase().includes(filters.name.toLowerCase()) : true
  );

  const handleStatusChange = async (id, oldStatus, newStatus) => {
    if (oldStatus === newStatus) return;

    try {
      // 1) вызываем thunk и ждём, чтобы убедиться, что сервер успешно применил изменение
      const result = await dispatch(updateApplicationStatus({ id, status: newStatus })).unwrap();

      // 2) уведомление об успехе
      message.success('Статус обновлён');

      // 3) обновляем статистику (только она)
      dispatch(getStats({ 
        startDate: currentPeriod.current.startIso, 
        endDate: currentPeriod.current.endIso 
      }));

      // 4) перезагружаем текущую страницу таблицы, чтобы отобразить актуальные данные сервера
      //    используем pagination.page (если есть) или 1
      const pageToLoad = pagination?.page || 1;
      const pageSize = pagination?.limit || 10;
      dispatch(getAllLeads({
        page: pageToLoad,
        limit: pageSize,
        startDate: currentPeriod.current.startIso,
        endDate: currentPeriod.current.endIso,
        status: filters.status || undefined,
      }));

      // 5) если открыт Drawer и это та же заявка — обновляем детали
      if (drawerOpen && selectedApplication?.id === id) {
        dispatch(getApplicationById(id));
      }

      return result;
    } catch (err) {
      message.error(err?.message || 'Не удалось обновить статус');
      console.error('updateApplicationStatus failed:', err);
    }
  };

  // При смене фильтра по статусу - сразу серверный запрос + обновление статистики
  const handleStatusFilterChange = status => {
    setFilters(prev => ({ ...prev, status }));
    dispatch(getAllLeads({
      page: 1,
      limit: pagination.limit,
      startDate: currentPeriod.current.startIso,
      endDate: currentPeriod.current.endIso,
      status: status || undefined,
    }));
    dispatch(getStats({ 
      startDate: currentPeriod.current.startIso, 
      endDate: currentPeriod.current.endIso 
    }));
  };

  // Пагинация — учитываем период и статус
  const handleTableChange = (paginationObj) => {
    dispatch(getAllLeads({
      page: paginationObj.current,
      limit: paginationObj.pageSize,
      startDate: currentPeriod.current.startIso,
      endDate: currentPeriod.current.endIso,
      status: filters.status || undefined,
    }));
  };

  // Initial load — последние 7 дней
  useEffect(() => {
    dispatch(getStats({ 
      startDate: currentPeriod.current.startIso, 
      endDate: currentPeriod.current.endIso 
    }));
    dispatch(getAllLeads({
      page: 1,
      limit: pagination.limit,
      startDate: currentPeriod.current.startIso,
      endDate: currentPeriod.current.endIso,
      status: filters.status || undefined,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Имя', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: email => email ? <a href={`mailto:${email}`}>{email}</a> : '—' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: phone => phone ? <a href={`tel:${normalizePhone(phone)}`}>{phone}</a> : '—' },
    { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
    { title: 'Дата', dataIndex: 'createdAt', key: 'createdAt', render: date => date ? moment(date).format('DD.MM.YYYY HH:mm') : '—' },
    {
      title: 'Статус', dataIndex: 'status', key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={value => handleStatusChange(record.id, status, value)}
          options={Object.entries(STATUS_MAP).map(([key, val]) => ({
            value: key,
            label: <Tag color={val.color} style={{ margin: 0 }}>{val.label}</Tag>
          }))}
        />
      ),
    },
    {
      title: 'Действия', key: 'actions',
      render: (_, record) => <Button type="primary" size='small' icon={<EyeOutlined />} onClick={() => openDrawer(record.id)}>Детальный просмотр</Button>
    }
  ];

  return (
    <>
      <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
      <LogoutMenu />

      <Row gutter={16} style={{ marginBottom: 12, alignItems: 'center' }}>
        <Col>
          <div style={{ marginBottom: 4 }}>Статистика (выберите диапазон)</div>
          {/* Ключевое: используем простой RangePicker без value */}
          <RangePicker
            onChange={handleStatsRangeChange}
            format="DD.MM.YYYY"
            placeholder={['От', 'До']}
            allowClear
          />
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
          <Input
            placeholder="Введите имя"
            value={filters.name}
            onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
          />
        </Col>
        <Col>
          <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
          <Select
            placeholder="Выберите статус"
            value={filters.status || undefined}
            style={{ width: 180 }}
            allowClear
            onChange={handleStatusFilterChange}
          >
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
      />

      <Drawer title="Детальный просмотр заявки" placement="right" size="small" onClose={closeDrawer} open={drawerOpen}>
        {selectedApplication && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
            <Descriptions.Item label="Email"><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></Descriptions.Item>
            <Descriptions.Item label="Телефон">{selectedApplication.phone ? <a href={`tel:${normalizePhone(selectedApplication.phone)}`}>{selectedApplication.phone}</a> : '—'}</Descriptions.Item>
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