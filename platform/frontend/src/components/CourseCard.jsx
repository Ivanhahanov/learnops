import { Link } from "react-router-dom";

function CourseCard({ course }) {
    // TODO: if new pass counter; if started pass <completed>/<counter>
    const tasksStats = course.is_started ? `${course.completed_tasks}/${course.total_tasks}` : course.total_tasks
    const lecturesStats = course.is_started ? `${course.completed_lectures}/${course.total_lectures}` : course.total_lectures
    const quizzesStats = course.is_started ? `${course.completed_quizzes}/${course.total_quizzes}` : course.total_quizzes
    return (
        <div className="card w-full max-w-md bg-base-100 shadow p-4 border border-base-300">
            <Link to={`/course/${course.name}`}>
                <div className="card-header mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-primary">{course.title}</h2>
                            {/* TODO: status started/new */}
                            <p className="text-sm text-gray-500 italic">{course.is_started ? "" : "Новый"}</p>
                        </div>

                        <div className="flex justify-end gap-2">

                            <span className="badge badge-outline mb-4 capitalize">
                                {course.difficulty}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                    <p className="">{course.description}</p>
                </div>
                <div className="divider p-0 m-0"></div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <span className="text-xl font-bold text-primary">{lecturesStats}</span>
                        <p className="text-sm text-gray-500">Lectures</p>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-primary">
                            {tasksStats}
                        </span>
                        <p className="text-sm text-gray-500">Tasks</p>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-primary">{quizzesStats}</span>
                        <p className="text-sm text-gray-500">Tests</p>
                    </div>
                </div>

            </Link>
        </div>
    );
};


export default CourseCard;