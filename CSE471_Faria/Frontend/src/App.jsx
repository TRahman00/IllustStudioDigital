import React, {
  useRef,
  useState
} from "react";

import {
  Download,
  FilePlus2,
  FolderOpen,
  Save,
  Trash2
} from "lucide-react";


import Header
  from "./components/Header";

import Toolbar
  from "./components/Toolbar";

import LeftSidebar
  from "./components/LeftSidebar";

import Canvas
  from "./components/Canvas";

import PropertiesPanel
  from "./components/PropertiesPanel";


function App() {

  /* ----------------------------- */
  /* CANVAS */
  /* ----------------------------- */

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;


  /* ----------------------------- */
  /* STATE */
  /* ----------------------------- */

  const [activeTab, setActiveTab] =
    useState("Draw");


  const [selectedTool, setSelectedTool] =
    useState("brush");


  const [brushSize, setBrushSize] =
    useState(14);


  const [color, setColor] =
    useState("#12C8B8");


  const [strokes, setStrokes] =
    useState([]);


  const [isDrawing, setIsDrawing] =
    useState(false);


  const [history, setHistory] =
    useState([[]]);


  const [historyIndex, setHistoryIndex] =
    useState(0);


  const [projectName, setProjectName] =
    useState(
      "Untitled Illustration"
    );


  const fileInputRef =
    useRef(null);


  /* ----------------------------- */
  /* HISTORY */
  /* ----------------------------- */

  const addHistory = (
    newStrokes
  ) => {

    const newHistory =
      history.slice(
        0,
        historyIndex + 1
      );


    newHistory.push(
      structuredClone(
        newStrokes
      )
    );


    setHistory(
      newHistory
    );


    setHistoryIndex(
      newHistory.length - 1
    );

  };


  /* ----------------------------- */
  /* SET STROKES */
  /* ----------------------------- */

  const updateStrokes = (
    newStrokes
  ) => {

    setStrokes(
      newStrokes
    );

  };


  /* ----------------------------- */
  /* UNDO */
  /* ----------------------------- */

  const undo = () => {

    if (
      historyIndex <= 0
    ) {
      return;
    }


    const newIndex =
      historyIndex - 1;


    const previous =
      structuredClone(
        history[newIndex]
      );


    setHistoryIndex(
      newIndex
    );


    setStrokes(
      previous
    );

  };


  /* ----------------------------- */
  /* REDO */
  /* ----------------------------- */

  const redo = () => {

    if (
      historyIndex >=
      history.length - 1
    ) {
      return;
    }


    const newIndex =
      historyIndex + 1;


    const next =
      structuredClone(
        history[newIndex]
      );


    setHistoryIndex(
      newIndex
    );


    setStrokes(
      next
    );

  };


  /* ----------------------------- */
  /* NEW PROJECT */
  /* ----------------------------- */

  const newProject = () => {

    setStrokes([]);

    setHistory([[]]);

    setHistoryIndex(0);

    setProjectName(
      "Untitled Illustration"
    );

  };


  /* ----------------------------- */
  /* CLEAR CANVAS */
  /* ----------------------------- */

  const clearCanvas = () => {

    setStrokes([]);

    addHistory([]);

  };


  /* ----------------------------- */
  /* EXPORT PNG */
  /* ----------------------------- */

  const exportPNG = () => {

    const canvas =
      document.querySelector(
        "canvas"
      );


    if (!canvas)
      return;


    const link =
      document.createElement(
        "a"
      );


    link.download =
      `${projectName}.png`;


    link.href =
      canvas.toDataURL(
        "image/png"
      );


    link.click();

  };


  /* ----------------------------- */
  /* EXPORT PROJECT */
  /* ----------------------------- */

  const exportProject = () => {

    const project = {

      name:
        projectName,

      width:
        CANVAS_WIDTH,

      height:
        CANVAS_HEIGHT,

      strokes:
        strokes

    };


    const blob =
      new Blob(
        [
          JSON.stringify(
            project,
            null,
            2
          )
        ],

        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;


    link.download =
      `${projectName}.illust.json`;


    link.click();


    URL.revokeObjectURL(
      url
    );

  };


  /* ----------------------------- */
  /* IMPORT PROJECT */
  /* ----------------------------- */

  const importProject = (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file)
      return;


    const reader =
      new FileReader();


    reader.onload = () => {

      try {

        const project =
          JSON.parse(
            reader.result
          );


        setProjectName(
          project.name ||
            "Imported Illustration"
        );


        setStrokes(
          project.strokes || []
        );


        setHistory([
          project.strokes || []
        ]);


        setHistoryIndex(0);

      }

      catch {

        alert(
          "Invalid Illust Studio project file."
        );

      }

    };


    reader.readAsText(
      file
    );


    event.target.value = "";

  };


  /* ----------------------------- */
  /* IMAGE BUTTON */
  /* ----------------------------- */

  const openImage = () => {

    alert(
      "Image import can be connected here to your Module 3 Image Editing System."
    );

  };


  return (

    <div
      className="
        h-screen
        w-full

        bg-studio-bg

        text-studio-text
      "
    >

      {/* -------------------------------- */}
      {/* TOP BROWSER-LIKE STRIP */}
      {/* -------------------------------- */}

      <div
        className="
          h-7

          flex
          items-center
          justify-between

          px-4

          bg-[#161817]

          border-b
          border-white/5

          text-[11px]
          text-studio-muted
        "
      >

        <span>
          Illust Studio workspace
        </span>


        <button
          className="
            px-2
            py-0.5

            rounded

            border
            border-white/10

            hover:bg-white/5
          "
        >

          Help

        </button>

      </div>


      {/* -------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------- */}

      <Header

        activeTab={
          activeTab
        }

        setActiveTab={
          setActiveTab
        }

      />


      {/* -------------------------------- */}
      {/* TOOLBAR */}
      {/* -------------------------------- */}

      <Toolbar

        selectedTool={
          selectedTool
        }

        setSelectedTool={
          setSelectedTool
        }


        brushSize={
          brushSize
        }

        setBrushSize={
          setBrushSize
        }


        color={
          color
        }

        setColor={
          setColor
        }


        undo={
          undo
        }

        redo={
          redo
        }

      />


      {/* -------------------------------- */}
      {/* MAIN APPLICATION */}
      {/* -------------------------------- */}

      <main
        className="
          flex

          h-[calc(100vh-93px)]
        "
      >

        {/* LEFT SIDEBAR */}

        <LeftSidebar

          openImage={
            openImage
          }

        />


        {/* CENTER WORKSPACE */}

        <section
          className="
            flex
            flex-1
            min-w-0
            flex-col
          "
        >

          {/* PROJECT BAR */}

          <div
            className="
              h-10

              flex
              items-center
              justify-between

              px-4

              bg-[#07100E]

              border-b
              border-studio-border
            "
          >

            <input

              value={
                projectName
              }

              onChange={(e) =>
                setProjectName(
                  e.target.value
                )
              }

              className="
                w-72

                bg-transparent

                outline-none

                text-xs
                font-medium
              "

            />


            <span
              className="
                text-[11px]

                text-studio-muted
              "
            >

              Module 1 • Art Creation

            </span>

          </div>


          {/* CANVAS */}

          <div
            className="
              flex-1
              min-h-0
            "
          >

            <Canvas

              width={
                CANVAS_WIDTH
              }

              height={
                CANVAS_HEIGHT
              }


              strokes={
                strokes
              }

              setStrokes={
                updateStrokes
              }


              selectedTool={
                selectedTool
              }


              color={
                color
              }


              brushSize={
                brushSize
              }


              isDrawing={
                isDrawing
              }

              setIsDrawing={
                setIsDrawing
              }


              addHistory={
                addHistory
              }

            />

          </div>


          {/* BOTTOM BAR */}

          <div
            className="
              h-14

              flex
              items-center
              gap-3

              px-4

              bg-[#091311]

              border-t
              border-studio-border
            "
          >

            {/* CLEAR */}

            <button
              title="Clear Canvas"

              onClick={
                clearCanvas
              }

              className="
                w-8
                h-8

                flex
                items-center
                justify-center

                rounded-md

                border
                border-studio-border

                text-studio-muted

                hover:text-red-300
              "
            >

              <Trash2 size={14} />

            </button>


            <div
              className="
                w-px
                h-8

                bg-studio-border
              "
            />


            <div
              className="
                flex
                items-center
                gap-2

                text-[11px]

                text-studio-muted
              "
            >

              <span
                className="
                  w-2
                  h-2

                  rounded-full

                  bg-studio-teal
                "
              />

              1000 × 600

            </div>


            <div
              className="
                ml-auto

                flex
                gap-2
              "
            >

              {/* NEW */}

              <button
                onClick={
                  newProject
                }

                className="
                  flex
                  items-center
                  gap-2

                  px-3
                  py-1.5

                  rounded-md

                  border
                  border-studio-border

                  text-[11px]

                  text-studio-muted

                  hover:text-studio-text
                "
              >

                <FilePlus2
                  size={13}
                />

                New

              </button>


              {/* OPEN */}

              <button
                onClick={() =>
                  fileInputRef
                    .current
                    ?.click()
                }

                className="
                  flex
                  items-center
                  gap-2

                  px-3
                  py-1.5

                  rounded-md

                  border
                  border-studio-border

                  text-[11px]

                  text-studio-muted

                  hover:text-studio-text
                "
              >

                <FolderOpen
                  size={13}
                />

                Open

              </button>


              {/* SAVE */}

              <button
                className="
                  flex
                  items-center
                  gap-2

                  px-3
                  py-1.5

                  rounded-md

                  border
                  border-studio-border

                  text-[11px]

                  text-studio-muted

                  hover:text-studio-text
                "
              >

                <Save
                  size={13}
                />

                Save

              </button>


              {/* EXPORT */}

              <button
                onClick={
                  exportPNG
                }

                className="
                  flex
                  items-center
                  gap-2

                  px-3
                  py-1.5

                  rounded-md

                  bg-studio-teal

                  text-[#03100E]

                  text-[11px]

                  font-semibold

                  hover:bg-studio-tealLight
                "
              >

                <Download
                  size={13}
                />

                Export PNG

              </button>

            </div>


            {/* HIDDEN FILE INPUT */}

            <input

              ref={
                fileInputRef
              }

              type="file"

              accept=".json"

              onChange={
                importProject
              }

              className="hidden"

            />

          </div>

        </section>


        {/* RIGHT PANEL */}

        <PropertiesPanel

          selectedTool={
            selectedTool
          }

          brushSize={
            brushSize
          }

          setBrushSize={
            setBrushSize
          }

          color={
            color
          }

          setColor={
            setColor
          }

          width={
            CANVAS_WIDTH
          }

          height={
            CANVAS_HEIGHT
          }

        />

      </main>

    </div>

  );

}

export default App;