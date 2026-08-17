import {
  ChevronDown,
  Cloud
} from "lucide-react";


function PropertiesPanel({
  selectedTool,

  brushSize,
  setBrushSize,

  color,
  setColor,

  width,
  height
}) {

  return (

    <aside
      className="
        hidden
        xl:block

        w-64
        shrink-0

        bg-[#08110F]

        border-l
        border-studio-border
      "
    >

      {/* TITLE */}

      <div
        className="
          px-4
          py-3

          text-xs
          font-semibold

          border-b
          border-studio-border
        "
      >

        Tool Properties

      </div>


      <div
        className="
          p-4
          space-y-5
        "
      >

        {/* CURRENT TOOL */}

        <div>

          <div
            className="
              mb-2

              text-[10px]
              uppercase
              tracking-wider

              text-studio-muted
            "
          >

            Current Tool

          </div>


          <div
            className="
              flex
              items-center

              px-3
              py-2

              rounded-lg

              bg-studio-panel

              border
              border-studio-border

              text-xs
            "
          >

            {selectedTool}

            <ChevronDown
              size={13}

              className="
                ml-auto

                text-studio-muted
              "
            />

          </div>

        </div>


        {/* SIZE */}

        <div>

          <div
            className="
              flex
              justify-between

              mb-2

              text-[10px]
              uppercase

              text-studio-muted
            "
          >

            <span>
              Brush Size
            </span>

            <span>
              {brushSize}px
            </span>

          </div>


          <input
            type="range"

            min="1"
            max="60"

            value={brushSize}

            onChange={(e) =>
              setBrushSize(
                Number(
                  e.target.value
                )
              )
            }

            className="
              w-full
            "
          />

        </div>


        {/* COLOR */}

        <div>

          <div
            className="
              mb-2

              text-[10px]
              uppercase

              text-studio-muted
            "
          >

            Color

          </div>


          <div
            className="
              flex
              items-center
              gap-3

              p-3

              rounded-lg

              bg-studio-panel

              border
              border-studio-border
            "
          >

            <label
              className="
                w-8
                h-8

                rounded-full

                overflow-hidden

                cursor-pointer
              "
            >

              <input
                type="color"

                value={color}

                onChange={(e) =>
                  setColor(
                    e.target.value
                  )
                }

                className="
                  w-10
                  h-10
                "
              />

            </label>


            <span
              className="
                text-xs
                font-mono
              "
            >

              {color.toUpperCase()}

            </span>

          </div>

        </div>


        {/* CANVAS SIZE */}

        <div>

          <div
            className="
              mb-2

              text-[10px]
              uppercase

              text-studio-muted
            "
          >

            Canvas

          </div>


          <div
            className="
              grid
              grid-cols-2
              gap-2
            "
          >

            <div
              className="
                p-2

                rounded-lg

                bg-studio-panel

                border
                border-studio-border
              "
            >

              <div
                className="
                  text-[9px]
                  text-studio-muted
                "
              >
                Width
              </div>

              <div
                className="
                  mt-1
                  text-xs
                "
              >

                {width}px

              </div>

            </div>


            <div
              className="
                p-2

                rounded-lg

                bg-studio-panel

                border
                border-studio-border
              "
            >

              <div
                className="
                  text-[9px]
                  text-studio-muted
                "
              >
                Height
              </div>

              <div
                className="
                  mt-1
                  text-xs
                "
              >

                {height}px

              </div>

            </div>

          </div>

        </div>


        {/* CLOUD INFO */}

        <div
          className="
            p-3

            rounded-lg

            bg-studio-panel

            border
            border-studio-border

            text-[11px]

            leading-5

            text-studio-muted
          "
        >

          <div
            className="
              flex
              items-center
              gap-2

              mb-1

              text-studio-text
            "
          >

            <Cloud
              size={14}
              className="
                text-studio-teal
              "
            />

            Cloud Storage

          </div>


          Your artwork can be
          saved to your artist
          profile and exported
          to your local device.

        </div>

      </div>

    </aside>

  );
}

export default PropertiesPanel;
