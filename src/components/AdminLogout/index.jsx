import { useNavigate } from "react-router";
import { LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";

const LogoutMenu = () => {
    const navigate = useNavigate();

    const exit = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <Button
            type="primary"
            size="small"
            danger
            icon={<LogoutOutlined />}
            onClick={exit}
            style={{
                position: 'fixed', // ---------- фиксируем кнопку
                top: 20,           // ---------- отступ сверху
                right: 20,         // ---------- отступ справа
                zIndex: 1000,
            }}
        >
            Выйти
        </Button>
    );
};

export default LogoutMenu;
