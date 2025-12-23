import { Form, Button, Input, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "../../redux/slices/adminSignIn";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const AdminSignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { loading, error, token } = useSelector((state) => state.admin);

  

  const onFinish = (values) => {
    console.log("Форма отправлена, значения:", values);
    dispatch(loginAdmin(values))
    .unwrap()
    .then((res) => {
        console.log("Ответ сервера после успешного логина:", res);
      messageApi.open({
        type: "success",
        content: "Вход выполнен успешно",
      });
      navigate("/admin", { replace: true });
    })
    .catch((err) => {
      // err приходит из thunk.rejectWithValue
      if (err?.errors && err.errors.length) {
        // показываем каждое поле отдельно
        err.errors.forEach(e =>
          messageApi.open({
            type: "error",
            content: `${e.field}: ${e.message}`,
          })
        );
      } else {
        // общий fallback
        messageApi.open({
          type: "error",
          content: err?.message || "Ошибка входа",
        });
      }
    });
  
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
            maxWidth: 450,
            width: "95%",
            margin: "80px auto",
            padding: "40px 30px",
            borderRadius: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            background: "linear-gradient(135deg, #ffffff, #f0f2f5)",
            transition: "all 0.3s ease",
            textAlign: "center",
          }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Вход для администратора
        </h2>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Логин/e-mail:"
            name="email"
            rules={[{ required: true, message: "Введите ваш логин!" }]}
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>

          <Form.Item
            label="Пароль:"
            name="password"
            rules={[{ required: true, message: "Введите ваш пароль!" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" block loading={loading}   style={{
                borderRadius: 8,
                backgroundColor: "#4a90e2",
                borderColor: "#4a90e2",
                fontWeight: 600,
                fontSize: 16,
              }}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default AdminSignIn;
