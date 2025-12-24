import { Form, Input, Button, message } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useDispatch } from "react-redux";
import { submitRequest } from "../../redux/slices/requestSlice";
import { formatRequestData } from "../../utils/utmParams";
import { getSavedUtmParams } from "../../utils/utmParams";
import { useState,useEffect } from "react";


const ClientRequest = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const utm = getSavedUtmParams();
        console.log("📋 UTM для отправки формы:", utm);
      }, []);


    const onFinish = (values) => {
        setLoading(true)

        const requestData = formatRequestData(values);
        console.log("FINAL_PAYLOAD_BEFORE_SEND:", JSON.stringify(requestData, null, 2));
        console.log('Отформатированные данные для отправки:', requestData);
        console.log("=== ОТПРАВКА ФОРМЫ ===");
        console.log("📝 Данные формы:", values);
        console.log("🔗 UTM параметры:", {
          source: requestData.utm_source,
          medium: requestData.utm_medium,
          campaign: requestData.utm_campaign
        });
        console.log("📤 Полный payload:", requestData);
        dispatch(submitRequest(requestData)).unwrap()
            .then(() => {
                console.log('Запрос успешно отправлен и обработан');
                messageApi.open({
                    type: "success",
                    content: "Заявка успешно отправлена. Мы свяжемся с вами.",
                })
                form.resetFields();
            })
            .catch((err) => {
                console.error("Ошибка при отправке формы:", err);
                messageApi.open({
                    type: "error",
                    content: typeof err === "string" ? err : "Произошла ошибка",
                });
            })
            .finally(() => {
                setLoading(false);
            });

    }


    const phoneValidator = (_, value) => {
        if (!value) return Promise.resolve(); // ❗ пустоту не проверяем здесь

        const digits = value.replace(/\D/g, "");
        if (digits.length < 9) {
            return Promise.reject(new Error("Введите корректный номер телефона"));
        }

        return Promise.resolve();
    };


    return (
        <>
            {contextHolder}

            <div style={{
                maxWidth: 450,
                width: "95%",
                margin: "80px auto",
                padding: "40px 30px",
                borderRadius: 16,
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                transition: "all 0.3s ease",
                textAlign: "center",
            }}>
                <h2 style={{ marginBottom: 30, fontWeight: 600, color: "#333" }}>
                    Оставьте заявку
                </h2>

                <Form form={form} layout="vertical" onFinish={onFinish} validateTrigger="onBlur">
                    <Form.Item
                        label="Имя:"
                        name="name"
                        rules={[{ required: true, message: "Введите имя" }, { min: 2 }]}
                        validateTrigger="onBlur"
                    >
                        <Input placeholder="Иван Иванов" />
                    </Form.Item>

                    <Form.Item
                        label="Телефон:"
                        name="phone"
                        rules={[
                            { required: true, message: "Введите телефон" },
                            // Добавляем валидатор
                            { validator: phoneValidator }
                        ]}
                    >
                        <PhoneInput
                            country="by"
                            enableSearch
                            countryCodeEditable={false}
                            inputStyle={{
                                width: "100%"
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="E-mail:"
                        name="email"
                        rules={[
                            { required: true, message: "Введите email" },
                            {
                                type: "email",
                                message: "Некорректный email. Проверьте наличие @",
                            },
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input placeholder="ivan@example.com
" />
                    </Form.Item>

                    <Form.Item label="Комментарий" name="comment">
                        <Input.TextArea rows={4} placeholder="Хочу узнать больше о ваших услугах
" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block loading={loading} disabled={loading} style={{
                        borderRadius: 8,
                        padding: "12px 0",
                        fontWeight: 600,
                        fontSize: 16,
                        marginTop: 10,
                    }}>
                        {loading ? "Отправка..." : "Отправить"}
                    </Button>
                </Form>
            </div>
        </>
    );
};

export default ClientRequest;
