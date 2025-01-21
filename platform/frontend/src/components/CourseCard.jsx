import { Link } from "react-router-dom";

// function CourseCard({course}) {
//     return (
//         <Link to={`/course/${course.course.urlId}`}>
//         <div key={course.course.urlId} className="card bg-base-200 shadow p-4">
//             <h3 className="text-lg font-semibold mb-2">{course.course.title}</h3>
//             <p className="text-sm text-gray-500 mb-2">Категория: {course.course.category}</p>
//             <p className="text-sm text-gray-500 mb-2">Сложность: {course.course.difficulty}</p>
//             <div className="flex flex-wrap gap-2 mb-2">
//                 {course.course.tags.map((tag) => (
//                     <span
//                         key={tag}
//                         className="badge badge-primary text-sm px-2 py-1"
//                     >
//                         {tag}
//                     </span>
//                 ))}
//             </div>
//             {/* <button className="btn btn-primary mt-4">Подробнее</button> */}
//         </div>
//         </Link>
//     )
// }

function CourseCard({ course }) {
    const tasks = "0/3"
    const lectures = 3
    const tests = "0/3"
    return (
        <Link to={`/course/${course.course.urlId}`}>
            <div className="card w-full max-w-md bg-base-100 shadow-xl p-4 border border-gray-500">

                <div className="card-header mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-primary">{course.course.title}</h2>
                            <p className="text-sm text-gray-500 italic">{course.course.category}</p>
                        </div>

                        <div className="flex justify-end gap-2">

                            <span className="badge badge-outline mb-4 capitalize">
                                {course.course.difficulty}
                            </span>
                            {course.course.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="badge badge-secondary text-sm px-2 py-1"
                                >
                                    {tag}
                                </span>
                            ))}

                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                    <p className="">{course.course.description}</p>
                </div>
                <div class="divider p-0 m-0"></div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <span className="text-xl font-bold text-primary">
                            {tasks}
                        </span>
                        <p className="text-sm text-gray-500">Tasks</p>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-primary">{lectures}</span>
                        <p className="text-sm text-gray-500">Lectures</p>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-primary">{tests}</span>
                        <p className="text-sm text-gray-500">Tests</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default CourseCard;