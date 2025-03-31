import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { 
  FiCheckCircle, 
  FiArrowRight, 
  FiAward, 
  FiBookOpen, 
  FiClock, 
  FiStar, 
  FiUsers,
  FiX,
  FiBarChart2,
  FiActivity,
  FiEye
} from 'react-icons/fi';


const userData = {
  skills: {
    labels: ['Frontend', 'Backend', 'DevOps', 'Testing', 'UI/UX', 'Database'],
    current: [85, 70, 60, 75, 80, 65],
    potential: [90, 85, 75, 85, 90, 80]
  },
  stats: {
    completedCourses: 12,
    completedModules: 45,
    learningHours: 45,
    achievements: 8,
    level: 'Профессионал'
  },
  achievements: [
    { id: 1, title: 'Стратег', icon: <FiAward />, description: 'Топ 5% платформы' },
    { id: 2, title: 'Перфекционист', icon: <FiStar />, description: '100% выполнение курсов' },
    { id: 3, title: 'Лидер', icon: <FiUsers />, description: '10+ командных проектов' },
    { id: 4, title: 'Марафонец', icon: <FiClock />, description: '50+ часов обучения' }
  ],
  courses: {
    completed: [
      { id: 1, title: 'Продвинутый React', impact: [10, 5, 2, 3, 8, 1] },
      { id: 2, title: 'Node.js Мастерство', impact: [3, 15, 10, 5, 2, 12] }
    ],
    recommended: [
      { 
        id: 3, 
        title: 'Полный курс DevOps', 
        skills: ['DevOps', 'Database', 'Backend'],
        impact: [2, 20, 25, 10, 5, 18],
        progress: 30
      },
      { 
        id: 4, 
        title: 'UI/UX Проектирование', 
        skills: ['UI/UX', 'Frontend'],
        impact: [15, 2, 5, 8, 25, 3],
        progress: 65
      },
      { 
        id: 5, 
        title: 'Продвинутый Python', 
        skills: ['Backend', 'Database'],
        impact: [5, 25, 10, 15, 5, 20],
        progress: 45
      }
    ]
  }
};

const ProfilePage = () => {
  const radarChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('completed');
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const chartInstance = useRef(null);
  const lineChartInstance = useRef(null);
  

  // Инициализация радар-чарта
  useEffect(() => {
    const ctx = radarChartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: userData.skills.labels,
        datasets: [{
          label: 'Текущие навыки',
          data: userData.skills.current,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'Потенциал',
          data: hoveredCourse ? 
            userData.skills.current.map((v, i) => v + hoveredCourse.impact[i]) : 
            userData.skills.potential,
          borderColor: hoveredCourse ? '#10b981' : 'rgba(255, 159, 64, 0.3)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: { 
              color: 'rgba(0, 0, 0, 0.05)',
              lineWidth: 1
            },
            angleLines: { 
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            pointLabels: {
              color: 'hsl(var(--bc))',
              font: { size: 14 }
            },
            ticks: { display: false }
          }
        },
        plugins: {
          legend: { 
            position: 'top',
            labels: { 
              color: 'hsl(var(--bc))',
              boxWidth: 15,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'hsl(var(--b1))',
            titleColor: 'hsl(var(--bc))',
            bodyColor: 'hsl(var(--bc))',
            borderColor: 'hsl(var(--bc)/0.1)',
            boxPadding: 10
          }
        }
      }
    });

    return () => chartInstance.current.destroy();
  }, []);

  // Обновление данных радар-чарта
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.data.datasets[1].data = hoveredCourse ? 
        userData.skills.current.map((v, i) => v + hoveredCourse.impact[i]) : 
        userData.skills.potential;
      
      chartInstance.current.data.datasets[1].borderColor = hoveredCourse ? 
        '#10b981' : 'rgba(255, 159, 64, 0.3)';
      
      chartInstance.current.update();
    }
  }, [hoveredCourse]);

  // Линейный график прогресса
  useEffect(() => {
    const ctx = lineChartRef.current.getContext('2d');
    
    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
        datasets: [{
          label: 'Прогресс обучения',
          data: [12, 18, 23, 27, 35, 42],
          borderColor: 'hsl(var(--p))',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: 'hsl(var(--bc))' }
          },
          x: {
            grid: { display: false },
            ticks: { color: 'hsl(var(--bc))' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    return () => lineChartInstance.current.destroy();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      {/* Основная статистика */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="avatar placeholder mb-4">
                <div className="w-24 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white text-4xl">
                  <span>JD</span>
                </div>
              </div>
              <h2 className="card-title mb-2">John Developer</h2>
              <div className="badge badge-primary gap-2">
                <FiStar /> {userData.stats.level}
              </div>
            </div>

            <div className="divider" />

            <div className="space-y-4">
              <h3 className="font-bold text-lg"><FiAward className="mr-2 inline" />Достижения</h3>
              {userData.achievements.slice(0,2).map(ach => (
                <div key={ach.id} className="flex items-center gap-3 p-3 bg-base-100 rounded-box">
                  <div className="text-2xl text-primary">{ach.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{ach.title}</div>
                    <div className="text-sm text-gray-500 truncate">{ach.description}</div>
                  </div>
                </div>
              ))}
              <button 
                className="btn btn-ghost btn-sm w-full mt-2"
                onClick={() => setShowAchievementsModal(true)}
              >
                <FiEye className="mr-2" /> Все достижения
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title mb-4"><FiActivity className="mr-2" />Прогресс обучения</h2>
              <div className="h-64">
                <canvas ref={lineChartRef} />
              </div>
              <div className="stats stats-horizontal shadow mt-4 bg-base-100">
                <div className="stat">
                  <div className="stat-title">Курсы</div>
                  <div className="stat-value">{userData.stats.completedCourses}</div>
                  <div className="stat-desc">Пройдено</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Модули</div>
                  <div className="stat-value">{userData.stats.completedModules}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Часы</div>
                  <div className="stat-value">{userData.stats.learningHours}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid lg:grid-cols-[1fr_500px] gap-8">
        {/* Левая колонка - Курсы */}
        <div className="space-y-4">
          <div className="tabs tabs-boxed bg-base-100 shadow-sm mb-4 w-96">
            <button 
              className={`tab ${activeTab === 'completed' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Пройденные курсы
            </button> 
            <button 
              className={`tab ${activeTab === 'recommended' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              Рекомендуемые курсы
            </button>
          </div>

          {userData.courses[activeTab].map(course => (
            <div 
              key={course.id}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
              onMouseEnter={() => activeTab === 'recommended' && setHoveredCourse(course)}
              onMouseLeave={() => activeTab === 'recommended' && setHoveredCourse(null)}
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="card-title mb-2">{course.title}</h3>
                    {activeTab === 'recommended' && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {course.skills?.map(skill => (
                          <span key={skill} className="badge badge-outline badge-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {course.progress !== undefined && (
                      <div className="flex items-center gap-4">
                        <progress 
                          className="progress progress-primary w-32" 
                          value={course.progress} 
                          max="100"
                        />
                        <span className="text-sm">{course.progress}% завершено</span>
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary btn-sm gap-2">
                    {activeTab === 'completed' ? 'Повторить' : 'Продолжить'}
                    <FiArrowRight className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Правая колонка - График */}
        <div className="card bg-base-100 shadow-xl h-fit sticky top-4">
          <div className="card-body">
            <h2 className="card-title mb-4"><FiBarChart2 className="mr-2" />Развитие навыков</h2>
            <div className="h-[500px]">
              <canvas ref={radarChartRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно достижений */}
      <div className={`modal ${showAchievementsModal ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl bg-base-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Все достижения</h3>
            <button 
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => setShowAchievementsModal(false)}
            >
              <FiX />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.achievements.map(ach => (
              <div key={ach.id} className="flex items-center gap-4 p-4 bg-base-100 rounded-box">
                <div className="text-2xl text-primary">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{ach.title}</div>
                  <div className="text-sm text-gray-500 truncate">{ach.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;