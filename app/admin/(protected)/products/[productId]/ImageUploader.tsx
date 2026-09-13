"use client";

import {
  useRef,
  useState,
} from "react";

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Props = {
  productId: string;
  slug: string;
  images: ProductImage[];
};

export default function ImageUploader({
  productId,
  slug,
  images,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    replacingId,
    setReplacingId,
  ] = useState<string | null>(
    null
  );

  // =====================================
  // UPLOAD / REPLACE
  // =====================================
async function uploadImage(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const selectedFiles = Array.from(
    event.target.files ?? []
  );

  if (selectedFiles.length === 0) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  // Nếu đang REPLACE thì chỉ lấy 1 ảnh
  const filesToUpload = replacingId
    ? [selectedFiles[0]]
    : selectedFiles;

  // Kiểm tra tất cả ảnh trước khi upload
  for (const file of filesToUpload) {
    if (!allowedTypes.includes(file.type)) {
      alert(
        `${file.name} is not a JPG, PNG or WebP image.`
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        `${file.name} is larger than 10 MB.`
      );

      event.target.value = "";
      return;
    }
  }

  setLoading(true);

  try {
    // Upload từng ảnh một
    for (
      let index = 0;
      index < filesToUpload.length;
      index++
    ) {
      const file =
        filesToUpload[index];

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      formData.append(
        "productId",
        productId
      );

      formData.append(
        "slug",
        slug
      );

      // REPLACE chỉ áp dụng cho 1 ảnh
      if (
        replacingId &&
        index === 0
      ) {
        formData.append(
          "imageId",
          replacingId
        );
      }

      const response =
        await fetch(
          "/api/admin/products/image",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Upload failed: ${file.name}`
        );
      }
    }

    window.location.reload();
  } catch (error) {
    console.error(
      "Upload image error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Upload image failed."
    );
  } finally {
    setLoading(false);
    setReplacingId(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
}

  

  // =====================================
  // ADD IMAGE
  // =====================================

 function addImage() {
  setReplacingId(null);

  if (inputRef.current) {
    inputRef.current.multiple = true;
    inputRef.current.click();
  }
}

  // =====================================
  // REPLACE IMAGE
  // =====================================

  function replaceImage(
  imageId: string
) {
  setReplacingId(imageId);

  if (inputRef.current) {
    inputRef.current.multiple = false;
    inputRef.current.click();
  }
}

  // =====================================
  // REMOVE IMAGE
  // =====================================

  async function removeImage(
    image: ProductImage
  ) {
    const confirmed =
      confirm(
        `Remove image ${image.sort_order}?`
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/products/image",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              productId,
              imageId:
                image.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Delete failed."
        );
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "Delete image error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Delete image failed."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // SORT IMAGES
  // =====================================

  const sortedImages = [
    ...images,
  ].sort(
    (a, b) =>
      a.sort_order -
      b.sort_order
  );

  // =====================================
  // UI
  // =====================================

  return (
    <div className="bg-white p-7 sm:p-8">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex items-start justify-between gap-6">

        <div>

          <h3 className="text-[11px] tracking-[0.25em]">
            SHOE IMAGES
          </h3>

          <p className="mt-3 text-xs leading-6 text-gray-400">
            Add as many product images as
            you need. The first image is
            the main product image.
          </p>

        </div>

        <div className="shrink-0 text-right">

          <p className="font-serif text-2xl">
            {sortedImages.length}
          </p>

          <p className="mt-1 text-[9px] tracking-[0.2em] text-gray-400">
            IMAGES
          </p>

        </div>

      </div>


      {/* =================================
          HIDDEN INPUT
      ================================= */}

    <input
  ref={inputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  multiple
  onChange={uploadImage}
  disabled={loading}
  className="hidden"
/>


      {/* =================================
          IMAGE GRID
      ================================= */}

      {sortedImages.length > 0 ? (

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

          {sortedImages.map(
            (image, index) => {

              const imageNumber =
                index + 1;

              return (
                <div
                  key={image.id}
                  className="group border border-black/10 bg-[#f7f5f1] p-3"
                >

                  {/* IMAGE */}

                  <div className="relative overflow-hidden bg-white">

                    <img
                      src={
                        image.image_url
                      }
                      alt={`VIREL bridal shoe image ${imageNumber}`}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />

                    {/* NUMBER */}

                    <div className="absolute left-3 top-3 bg-white/95 px-3 py-2">

                      <p className="text-[9px] tracking-[0.2em]">
                        {imageNumber ===
                        1
                          ? "MAIN"
                          : `IMAGE ${imageNumber}`}
                      </p>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="flex items-center justify-between gap-3 pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        replaceImage(
                          image.id
                        )
                      }
                      disabled={
                        loading
                      }
                      className="border border-black/20 px-4 py-3 text-[9px] tracking-[0.18em] transition hover:border-black disabled:opacity-50"
                    >
                      REPLACE
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          image
                        )
                      }
                      disabled={
                        loading
                      }
                      className="px-3 py-3 text-[9px] tracking-[0.18em] text-red-500 transition hover:text-red-700 disabled:opacity-50"
                    >
                      REMOVE
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>

      ) : (

        <div className="mt-8 border border-dashed border-black/20 bg-[#f7f5f1] px-6 py-16 text-center">

          <p className="font-serif text-2xl">
            No images yet
          </p>

          <p className="mt-3 text-xs text-gray-400">
            Add your first product image
            below.
          </p>

        </div>

      )}


      {/* =================================
          ADD IMAGE
      ================================= */}

      <button
        type="button"
        onClick={addImage}
        disabled={loading}
        className="
          mt-6
          flex
          w-full
          items-center
          justify-center
          gap-3
          border
          border-black
          bg-black
          px-6
          py-5
          text-[10px]
          tracking-[0.25em]
          text-white
          transition
          hover:bg-black/80
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
       {loading
  ? "UPLOADING..."
  : "+ ADD IMAGES"}
      </button>


      {/* =================================
          INFO
      ================================= */}

      <div className="mt-5 flex justify-between gap-6 text-[10px] leading-5 text-gray-400">

        <span>
          JPG, PNG or WebP
        </span>

        <span>
          Maximum 10 MB per image
        </span>

      </div>

    </div>
  );
}