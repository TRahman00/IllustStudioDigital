import {
  Pencil,
  Layers3,
  ImagePlus,
  Upload
} from "lucide-react";


function LeftSidebar({
  openImage
}) {

  return (

    <aside
      className="
        w-16
        shrink-0

        bg-[#08110F]

        border-r
        border-studio-border

        py-3
      "
    >

      <div
        className="
          flex
          flex-col
          items-center
          gap-2
        "
      >

        {/* DRAW */}

        <button
          title="Draw"

          className="
            tool-button
            active
          "
        >

          <Pencil size={17} />

        </button>


        {/* LAYERS */}

        <button
          title="Layers"

          className="tool-button"
        >

          <Layers3 size={17} />

        </button>


        {/* IMAGE */}

        <button
          title="Import Image"

          onClick={openImage}

          className="tool-button"
        >

          <ImagePlus size={17} />

        </button>


        {/* UPLOAD */}

        <button
          title="Upload Project"

          className="tool-button"
        >

          <Upload size={17} />

        </button>

      </div>

    </aside>

  );
}

export default LeftSidebar;