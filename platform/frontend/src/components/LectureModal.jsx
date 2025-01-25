import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Для поддержки расширений Markdown, таких как таблицы и чекбоксы
import "./image.css"
import { useAuth } from "../context/OAuthContext";

const MyImage = props => {
  const [fullSize, setFullSize] = useState();
  const handleClick = () => {
    setFullSize(!fullSize);
  };
  return (
    <img
      className={fullSize ? "large" : "small"}
      alt={props.alt}
      src={props.src}
      onClick={handleClick}
    />
  );
};
const LectureModal = ({ lectureId, isOpen, onClose, setModules }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false); // Отслеживание состояния лайка
  const [readingTime, setReadingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const renderers = {
    img: MyImage,
    a: (props) => {
      if (["youtube", "embed"].every((item) => props.href.includes(item))) {
        return (
          <a>
            <iframe src={props.href} allowFullScreen="allowFullScreen" />
          </a>
        );
      }
      return <a {...props}></a>;
    },
  };

  const fetchLecture = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lecture/${lectureId}`, {
        headers: {
          Authorization: `Bearer ${user.id_token}`,
        },
      });
      const data = await response.json();
      setText(data.content);
      calculateReadingTime(data.content);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReadingTime = (content) => {
    const words = content.split(/\s+/).length;
    const time = Math.ceil(words / 200); // 200 слов в минуту
    setReadingTime(time);
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/lecture/${lectureId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.id_token}`,
        },
      });
      setModules((prevModules) =>
        prevModules.map((module) => ({
          ...module,
          lectures: module.lectures.map((lecture) =>
            lecture.id === lectureId ? { ...lecture, completed: true } : lecture
          ),
        }))
      );
      onClose(); // Закрыть окно
    } catch (error) {
      console.error("Ошибка при отметке как прочитано:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLecture();
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
       <div id={lectureId} className="modal modal-open">
       <div className="modal-box max-w-none md:w-3/4 lg:w-1/2 p-5 flex flex-col gap-4 relative overflow-visible">
         <button
           className="absolute -top-3 -right-3 btn btn-sm btn-circle shadow-xl"
           onClick={onClose}
         >
           ✕
         </button>
         {isLoading ? (
           <div className="flex justify-center items-center h-60">
             <span className="loading loading-spinner loading-lg text-primary"></span>
           </div>
         ) : (
           <>
             <div
               className="prose max-w-none overflow-y-auto flex-1"
             >
               <div className="flex items-center gap-2 dark:text-white">
                 <svg
                   className="w-6 h-6"
                   aria-hidden="true"
                   xmlns="http://www.w3.org/2000/svg"
                   width="24"
                   height="24"
                   fill="none"
                   viewBox="0 0 24 24"
                 >
                   <path
                     stroke="currentColor"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                   />
                 </svg>
                 <span>{readingTime} мин.</span>
               </div>
               <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
                 {text}
               </ReactMarkdown>
               <div className="divider"></div>
               <div className="flex justify-between">
                 <button
                   className="flex items-center gap-2"
                   onClick={() => {
                     setIsLiked(!isLiked);
                     if (!isLiked) setLikes(likes + 1);
                     else setLikes(likes - 1);
                   }}
                 >
                   <svg
                     className={`w-6 h-6 ${isLiked ? "text-red-500" : ""
                       }`}
                     aria-hidden="true"
                     xmlns="http://www.w3.org/2000/svg"
                     width="24"
                     height="24"
                     fill="none"
                     viewBox="0 0 24 24"
                   >
                     <path
                       stroke="currentColor"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth="2"
                       d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                     />
                   </svg>
                   <span>{likes}</span>
                 </button>
                 <button className="btn btn-success" onClick={markAsRead}>
                   Прочитано
                 </button>
               </div>
             </div>
           </>
         )}
       </div>
     </div>
      )}
    </>
  );
};

export default LectureModal;


