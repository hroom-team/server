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
  
  try {
    // Получаем опросы со статусом "planned"
    const q = query(
      surveysRef, 
      where('status', '==', 'planned')
    );
    
    const querySnapshot = await getDocs(q);
    const totalSurveys = querySnapshot.size;
    let modifiedCount = 0;
    
    console.log(\`[\${new Date().toLocaleString()}] Найдено опросов со статусом "planned": \${totalSurveys}\`);
    
    for (const docSnapshot of querySnapshot.docs) {
      const survey = docSnapshot.data();
      const startDate = survey.start_date;
      
      // Проверяем, наступила ли дата начала
      if (startDate && startDate.toMillis() <= now.toMillis()) {
        console.log(\`Активация опроса: \${docSnapshot.id}\`);
        
        // Обновляем статус на "active"
        await updateDoc(doc(db, 'survey', docSnapshot.id), {
          status: 'active',
          updated_at: now
        });
        
        modifiedCount++;
      }
    }
    
    console.log(\`[\${new Date().toLocaleString()}] Изменено статусов: \${modifiedCount}\`);
    
  } catch (error) {
    console.error('Ошибка при мониторинге опросов:', error);
  }
}

// Запускаем мониторинг с интервалом
const interval = Number(process.env.INTERVAL) || 60000;
setInterval(monitorSurveys, interval);

// Первый запуск сразу при старте
monitorSurveys();`
  }
};