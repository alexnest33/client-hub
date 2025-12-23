const STORAGE_KEY = "traffic_source_v1";
const EXPIRY_DAYS = 7; // Храним UTM 7 дней

/** Сохраняем/обновляем UTM параметры при их наличии */
export const initTrafficSource = () => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get("utm_source") || null;
  const utm_medium = params.get("utm_medium") || null;
  const utm_campaign = params.get("utm_campaign") || null;

  // Проверяем, есть ли хоть один UTM параметр в URL
  const hasUtmInUrl = utm_source || utm_medium || utm_campaign;

  if (hasUtmInUrl) {
    // Есть UTM в URL — всегда обновляем
    const data = { 
      utm_source, 
      utm_medium, 
      utm_campaign,
      timestamp: new Date().toISOString() // Добавляем время сохранения
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("UTM обновлены:", data);
  } 
  // Если UTM нет в URL, НЕ трогаем сохраненные значения
  // чтобы не потерять источник перехода при навигации по сайту
};

/** Получаем сохраненные UTM с проверкой срока годности */
export const getSavedUtmParams = () => {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const data = JSON.parse(stored);
    
    // Проверяем, не устарели ли UTM (опционально)
    if (data.timestamp) {
      const savedDate = new Date(data.timestamp);
      const now = new Date();
      const daysDiff = (now - savedDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > EXPIRY_DAYS) {
        console.log("UTM устарели, удаляем");
        localStorage.removeItem(STORAGE_KEY);
        return {};
      }
    }
    
    return {
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
    };
  } catch {
    return {};
  }
};

/** Очищаем сохраненные UTM (например, после отправки формы) */
export const clearUtmParams = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

/** Формируем payload для отправки на сервер */
export const formatRequestData = (formValues) => {
  const utm = getSavedUtmParams();

  return {
    ...formValues,
    phone: formValues.phone?.startsWith("+")
      ? formValues.phone
      : `+${formValues.phone}`,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    comment: formValues.comment ?? null,
  };
};