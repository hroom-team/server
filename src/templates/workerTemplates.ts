export const workerTemplates = {
  pollMonitoring: {
    id: 'poll-monitoring',
    name: 'Мониторинг опросов',
    description: 'Мониторит опросы со статусом "planned" и активирует их при наступлении даты начала',
    code: `import { db } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

async function monitorSurveys() {
  const timestamp = new Date().toISOString();
  // Сообщаем о начале выполнения
  process.parentPort.postMessage({ 
    type: 'start',
    timestamp 
  });

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
    
    console.log(\`[\${timestamp}] Найдено опросов со статусом "planned": \${totalSurveys}\`);
    
    for (const docSnapshot of querySnapshot.docs) {
      const survey = docSnapshot.data();
      const startDate = survey.start_date;
      
      // Проверяем, наступила ли дата начала
      if (startDate && startDate.toMillis() <= now.toMillis()) {
        console.log(\`[\${timestamp}] Активация опроса: \${docSnapshot.id}\`);
        
        // Обновляем статус на "active"
        await updateDoc(doc(db, 'survey', docSnapshot.id), {
          status: 'active',
          updated_at: now
        });
        
        modifiedCount++;
      }
    }
    
    // Сообщаем об успешном завершении
    process.parentPort.postMessage({ 
      type: 'complete',
      timestamp: new Date().toISOString(),
      results: {
        totalSurveys,
        modifiedCount
      }
    });
    
  } catch (error) {
    console.error(\`[\${timestamp}] Ошибка при мониторинге опросов:\`, error);
    process.parentPort.postMessage({ 
      type: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}

// Запускаем мониторинг с интервалом
const interval = Number(process.env.INTERVAL) || 60000;
setInterval(monitorSurveys, interval);

// Первый запуск сразу при старте
monitorSurveys();`
  }
};