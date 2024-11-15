export const workerTemplates = {
  pollMonitoring: {
    id: 'poll-monitoring',
    name: 'Мониторинг опросов',
    description: 'Мониторит опросы со статусом "planned" и активирует их при наступлении даты начала',
    code: `import { db } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

async function monitorSurveys() {
  const surveysRef = collection(db, 'survey');
  const now = Timestamp.now();
  
  // Получаем опросы со статусом "planned"
  const q = query(
    surveysRef, 
    where('status', '==', 'planned')
  );
  
  try {
    const querySnapshot = await getDocs(q);
    
    for (const docSnapshot of querySnapshot.docs) {
      const survey = docSnapshot.data();
      const startDate = survey.start_date;
      
      // Проверяем, наступила ли дата начала
      if (startDate && startDate.toMillis() <= now.toMillis()) {
        console.log('Активация опроса:', docSnapshot.id);
        
        // Обновляем статус на "active"
        await updateDoc(doc(db, 'survey', docSnapshot.id), {
          status: 'active',
          updated_at: now
        });
      }
    }
  } catch (error) {
    console.error('Ошибка при мониторинге опросов:', error);
  }
}

// Запускаем мониторинг каждую минуту
setInterval(monitorSurveys, process.env.INTERVAL || 60000);

// Первый запуск сразу при старте
monitorSurveys();`
  }
};