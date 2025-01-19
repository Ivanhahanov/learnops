import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Для поддержки расширений Markdown, таких как таблицы и чекбоксы
import "./image.css"

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

const LectureModal = ({ markdownContent, isOpen, onClose, modalId }) => {
    const renderers = {
        img: MyImage,
        a: (props) => {
            if (['youtube', 'embed'].every((item) => props.href.includes(item))) {
              return (
                <a
                //   style={{
                //     position: 'relative',
                //     paddingBottom: ['56.25%', 'calc(56.25% * 0.75)'],
                //     width: ['unset', '75%'],
                //     height: 0,
                //     margin: '0 auto',
                //   }}
                >
                  <iframe
                    // style={{
                    //   border: 'none',
                    //   position: 'absolute',
                    //   top: 0,
                    //   left: 0,
                    //   width: '100%',
                    //   height: '100%',
                    // }}
                    src={props.href}
                    allowfullscreen="allowfullscreen"
                  />
                </a>
              );
            }
  
            return <a {...props}></a>;
          },
      };
  return (
    <>
      {isOpen && (
        <div id={`modal-${modalId}`} className="modal modal-open">
          <div className="modal-box max-w-none md:w-3/4 lg:w-1/2 p-5 overflow-y-hidden">
            <button
              className="absolute top-3 right-3 btn btn-sm btn-circle btn-outline"
              onClick={onClose}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Лекция</h2>
            <div className="prose max-w-none overflow-y-auto h-[calc(100vh-10rem)] ">
              <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LectureModal;