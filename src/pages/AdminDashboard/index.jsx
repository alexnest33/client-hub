import { Table, Drawer, Tag, Button, Descriptions, Select, Input, DatePicker, Row, Col, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeads, updateApplicationStatus,getApplicationById } from '../../redux/slices/adminPanelSlice';
import { EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import LogoutMenu from '../../components/AdminLogout';



const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { applications, pagination,selectedApplication } = useSelector((state) => state.adminPanel);

    const [filters, setFilters] = useState({
        name: '',
        status: '',
        dateRange: [],
    });

    
    const [drawerOpen, setDrawerOpen] = useState(false);
    

    const openDrawer = async (id) => {
        setDrawerOpen(true);
        await dispatch(getApplicationById(id));
      };

      const closeDrawer = () => setDrawerOpen(false);
    const filteredApplications = applications.filter(app => {
        const matchesName = app.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesStatus = filters.status ? app.status === filters.status : true;
        const matchesDate = filters.dateRange.length === 2
            ? moment(app.createdAt).isBetween(filters.dateRange[0], filters.dateRange[1], 'day', '[]')
            : true;
        return matchesName && matchesStatus && matchesDate;
    });

    const STATUS_MAP = {
        new: { label: 'Новая', color: 'blue' },
        in_progress: { label: 'В работе', color: 'orange' },
        completed: { label: 'Завершена', color: 'green' },
        rejected: { label: 'Отклонена', color: 'red' },
    };

    // ---------- Изменено: получаем объект из applications ----------
    // const selectedApplication1 = applications.find(app => app.id === selectedId);

    const columns = [
        { title: 'ID:', dataIndex: 'id', key: 'id' },
        { title: 'Имя:', dataIndex: 'name', key: 'name', render: text => <a>{text}</a> },
        {
            title: 'Email:',
            dataIndex: 'email',
            key: 'email',
            render: (email) => email ? <a href={`mailto:${email}`}>{email}</a> : '—'
        },
        { title: 'Телефон:', dataIndex: 'phone', key: 'phone' },
        { title: 'Комментарий:', dataIndex: 'comment', key: 'comment' },
        {
            title: 'Дата:',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: date => moment(date).format('DD.MM.YYYY HH:mm') // ---------- Изменено: красивый формат ----------
        },
        {
            title: 'Дата обновления:',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: date => moment(date).format('DD.MM.YYYY HH:mm') // ---------- Изменено: красивый формат ----------
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 160 }}
                    onChange={(value) => {
                        if (value !== status) {
                            dispatch(updateApplicationStatus({ id: record.id, status: value }));
                        }
                    }}
                    options={Object.entries(STATUS_MAP).map(([key, value]) => ({
                        value: key,
                        label: (
                            <Tag color={value.color} style={{ margin: 0 }}>
                                {value.label}
                            </Tag>
                        ),
                    }))}
                />
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    size='small'
                    icon={<EyeOutlined />}
                    onClick={() => openDrawer(record.id)} // ---------- Изменено ----------
                >
                    Детальный просмотр
                </Button>
            ),
        }
    ];

    const handleTableChange = (pagination) => {
        dispatch(getAllLeads({ page: pagination.current, limit: pagination.pageSize }));
    };

    useEffect(() => {
        dispatch(getAllLeads({ page: 1, limit: 10 }));
    }, [dispatch]);


    


    return (
        <>
            <Title level={3} style={{ marginBottom: 20 }}>Добро пожаловать в админ-панель</Title>
            <LogoutMenu />
            {/* ---------- Фильтры ---------- */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col>
                    <div style={{ marginBottom: 4 }}>Поиск по имени</div>
                    <Input
                        placeholder="Введите имя"
                        value={filters.name}
                        onChange={e => setFilters({ ...filters, name: e.target.value })}
                    />
                </Col>
                <Col>
                    <div style={{ marginBottom: 4 }}>Фильтр по статусу</div>
                    <Select
                        placeholder="Выберите статус"
                        value={filters.status || undefined} // ---------- Изменено ----------
                        style={{ width: 180 }}
                        allowClear
                        onChange={value => setFilters({ ...filters, status: value })}
                    >
                        {Object.entries(STATUS_MAP).map(([key, value]) => (
                            <Select.Option key={key} value={key}>
                                {value.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <div style={{ marginBottom: 4 }}>Диапазон дат</div>
                    <RangePicker
                        onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                        format="DD.MM.YYYY"
                        placeholder={['От', 'До']}
                    />
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredApplications} // ---------- Изменено: применяем фильтр ----------
                rowKey="id"
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                }}
                onChange={handleTableChange}
            />

            <Drawer
                title="Детальный просмотр заявки"
                placement="right"
                size="small"
                onClose={closeDrawer}
                open={drawerOpen}
            >
                {selectedApplication && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Имя">{selectedApplication.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Телефон">{selectedApplication.phone}</Descriptions.Item>
                        <Descriptions.Item label="Комментарий">{selectedApplication.comment || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Статус">
                            <Tag color={STATUS_MAP[selectedApplication.status]?.color || 'gray'}>
                                {STATUS_MAP[selectedApplication.status]?.label || 'UNKNOWN'}
                            </Tag>
                        </Descriptions.Item>
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
