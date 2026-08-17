import {
  Brush,
  Pencil,
  Eraser,
  WandSparkles,
  Undo2,
  Redo2
} from "lucide-react";

const tools = [
  {
    id: "brush",
    name: "Brush",
    icon: Brush
  },

  {
    id: "pencil",
    name: "Pencil",
    icon: Pencil
  },

  {
    id: "airbrush",
    name: "Airbrush",
    icon: WandSparkles
  },

  {
    id: "eraser",
    name: "Eraser",
    icon: Eraser
  }
];


function Toolbar({
  selectedTool,
  setSelectedTool,

  brushSize,
  setBrushSize,

  color,
  setColor,

  undo,
  redo
}) {

  return (

    <div
      className="
        h-12

        flex
        items-center
        gap-2

        px-4

        bg-[#091311]

        border-b
        border-studio-border
      "
    >

      {/* TOOLS */}

      <div
        className="
          flex
          items-center
          gap-1

          pr-3

          border-r
          border-studio-border
        "
      >

        {tools.map((tool) => {

          const Icon = tool.icon;

          return (

            <button
              key={tool.id}

              title={tool.name}

              onClick={() =>
                setSelectedTool(tool.id)
              }

              className={`
                tool-button

                ${
                  selectedTool === tool.id
                    ? "active"
                    : ""
                }
              `}
            >

              <Icon size={17} />

            </button>

          );

        })}

      </div>


      {/* SIZE */}

      <div
        className="
          flex
          items-center
          gap-2

          ml-2

          text-[10px]
          uppercase
          tracking-wide

          text-studio-muted
        "
      >

        <span>
          SIZE
        </span>

        <input
          type="range"

          min="1"
          max="60"

          value={brushSize}

          onChange={(e) =>
            setBrushSize(
              Number(e.target.value)
            )
          }

          className="w-20"
        />

        <span
          className="
            w-8
            text-right
            text-studio-text
          "
        >
          {brushSize}px
        </span>

      </div>


      {/* COLOR */}

      <label
        className="
          ml-3

          w-8
          h-8

          rounded-full

          overflow-hidden

          border
          border-studio-border

          cursor-pointer
        "
      >

        <input
          type="color"

          value={color}

          onChange={(e) =>
            setColor(e.target.value)
          }

          className="
            w-10
            h-10

            cursor-pointer
          "
        />

      </label>


      {/* UNDO / REDO */}

      <div
        className="
          ml-2

          pl-3

          border-l
          border-studio-border

          flex
          gap-1
        "
      >

        <button
          className="tool-button"
          title="Undo"

          onClick={undo}
        >

          <Undo2 size={16} />

        </button>


        <button
          className="tool-button"
          title="Redo"

          onClick={redo}
        >

          <Redo2 size={16} />

        </button>

      </div>

    </div>

  );
}

export default Toolbar;
