import { Link } from "react-router-dom";
import { FiBookOpen, FiCheckCircle, FiClock, FiStar } from "react-icons/fi";

function CourseCard({ course }) {
    const progress = course.is_completed ? 100 : 
        Math.round(((course.completed_lectures + course.completed_tasks + course.completed_quizzes) /
        (course.total_lectures + course.total_tasks + course.total_quizzes)) * 100 || 0);

    const difficultyColors = {
        beginner: 'bg-emerald-100 text-emerald-800',
        intermediate: 'bg-amber-100 text-amber-800',
        advanced: 'bg-rose-100 text-rose-800'
    };

    return (
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <Link to={`/course/${course.name}`} className="h-full flex flex-col">
                <figure className="relative h-36 overflow-hidden rounded-t-2xl">
                    <img 
                        src={course.image || '/course-placeholder.png'} 
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-100"
                    />
                    {course.is_completed && (
                        <div className="absolute top-2 right-2 badge badge-success gap-1">
                            <FiCheckCircle /> Completed
                        </div>
                    )}
                    {!course.is_started && (
                        <div className="absolute top-2 right-2 badge badge-info gap-1">
                            <FiStar /> New
                        </div>
                    )}
                </figure>

                <div className="card-body p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <span className={`badge ${difficultyColors[course.difficulty]} font-medium capitalize`}>
                            {course.difficulty}
                        </span>
                        <span className="flex items-center text-sm text-gray-500">
                            <FiClock className="mr-1" /> {course.duration}h
                        </span>
                    </div>

                    <h2 className="card-title text-lg font-bold mb-2">
                        {course.title}
                    </h2>

                    <p className="text-sm line-clamp-3 mb-4">
                        {course.description}
                    </p>

                    <div className="mt-auto space-y-3">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="flex flex-col items-center">
                                <FiBookOpen className="text-primary text-lg mb-1" />
                                <span className="text-sm font-semibold">
                                    {course.completed_lectures}/{course.total_lectures}
                                </span>
                                <span className="text-xs text-gray-500">Lectures</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <FiCheckCircle className="text-primary text-lg mb-1" />
                                <span className="text-sm font-semibold">
                                    {course.completed_tasks}/{course.total_tasks}
                                </span>
                                <span className="text-xs text-gray-500">Tasks</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <FiStar className="text-primary text-lg mb-1" />
                                <span className="text-sm font-semibold">
                                    {course.completed_quizzes}/{course.total_quizzes}
                                </span>
                                <span className="text-xs text-gray-500">Quizzes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default CourseCard;