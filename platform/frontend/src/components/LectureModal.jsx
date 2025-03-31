import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../context/OAuthContext";
import { FiCheckCircle, FiClock, FiHeart, FiX, FiArrowUp } from "react-icons/fi";

const LectureModal = ({ lectureId, isOpen, onClose, setModules }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef(null);

  const calculateReadingTime = useCallback((content) => {
    const words = content.split(/\s+/).length;
    const time = Math.ceil(words / 200);
    setReadingTime(time);
  }, []);

  const handleScroll = useCallback(() => {
    const element = contentRef.current;
    if (!element) return;

    const scrollPercentage = 
      (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setProgress(Math.round(scrollPercentage));
    setShowScrollTop(element.scrollTop > 500);
  }, []);

  const scrollToTop = () => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/lecture/${lectureId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.id_token}`,
        },
      });
      
      setModules(prev => prev.map(module => ({
        ...module,
        data: module.data.map(row => 
          row.id === lectureId ? { ...row, completed: true } : row
        )
      })));
      
      onClose();
    } catch (error) {
      console.error("Ошибка при отметке как прочитано:", error);
    }
  };

  const fetchLecture = useCallback(async () => {
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
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, user.id_token, calculateReadingTime]);

  useEffect(() => {
    if (isOpen) {
      fetchLecture();
      const contentElement = contentRef.current;
      if (contentElement) {
        contentElement.addEventListener('scroll', handleScroll);
      }
      return () => {
        if (contentElement) {
          contentElement.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [isOpen, fetchLecture, handleScroll]);

  const ImageComponent = ({ src, alt }) => (
    <div className="relative group my-4">
      <img
        src={src}
        alt={alt}
        className="rounded-xl shadow-lg w-full h-auto max-h-[60vh] object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
      <span className="absolute bottom-2 left-2 text-white text-sm">
        {alt}
      </span>
    </div>
  );

  const VideoEmbed = ({ href }) => (
    <div className="aspect-video w-full my-4 rounded-xl overflow-hidden shadow-lg">
      <iframe
        src={href}
        className="w-full h-full"
        allowFullScreen
        title="Видео лекции"
      />
    </div>
  );

  const components = {
    img: ImageComponent,
    a: ({ href, children }) => {
      if (href.includes('youtube.com') || href.includes('vimeo.com')) {
        return <VideoEmbed href={href} />;
      }
      return <a href={href} className="text-primary hover:underline">{children}</a>;
    },
    table: ({ children }) => (
      <div className="overflow-x-auto">
        <table className="table-auto w-full my-4">{children}</table>
      </div>
    ),
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''} !items-stretch`}>
      <div className="modal-box h-screen max-w-none w-full max-h-none h-full rounded-none p-0 flex flex-col bg-base-100">
        {/* Header */}
        <div className="p-4 border-b border-base-200 flex items-center justify-between sticky top-0 bg-base-100 z-10">
          <div className="flex items-center gap-2">
            <FiClock className="text-lg text-gray-500" />
            <span className="text-sm text-gray-500">{readingTime} мин</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                setLikes(prev => isLiked ? prev - 1 : prev + 1);
              }}
              className="btn btn-ghost btn-sm gap-2"
            >
              <FiHeart className={`text-lg ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              <span>{likes}</span>
            </button>
            
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm btn-ghost"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-base-200">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 md:px-6"
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <div className="max-w-xl mx-auto py-6">
              <ReactMarkdown
                components={components}
                remarkPlugins={[remarkGfm]}
                className="prose prose-base md:prose-lg"
              >
                {text}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-4">
          <div className="max-w-xs mx-auto">
            <button
              onClick={markAsRead}
              className="btn btn-primary w-full md:max-w-xs md:mx-auto gap-2"
              disabled={progress < 95}
            >
              <FiCheckCircle className="text-lg" />
              {progress >= 95 ? 'Завершить лекцию' : 'Прокрутите до конца'}
            </button>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 btn btn-circle btn-ghost bg-base-100/80 backdrop-blur shadow-md hover:bg-base-200 transition-all"
          >
            <FiArrowUp className="text-xl text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LectureModal;