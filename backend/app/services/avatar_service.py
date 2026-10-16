from io import BytesIO
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from supabase import Client, create_client

from app.core.config import get_settings


class AvatarService:
    BUCKET = "avatars"
    MAX_FILE_SIZE = 2 * 1024 * 1024
    IMAGE_SIZE = (256, 256)

    def __init__(self):
        settings = get_settings()

        self.client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )

        self.bucket = settings.supabase_avatar_bucket

    async def upload_avatar(self, user_id: UUID, file: UploadFile) -> str:
        if file.content_type not in (
            "image/jpeg",
            "image/png",
            "image/webp",
        ):
            raise HTTPException(
                status_code=400,
                detail="Unsupported image format",
            )

        content = await file.read(self.MAX_FILE_SIZE + 1)

        if len(content) > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image exceeds 2 MB limit",
            )

        try:
            with Image.open(BytesIO(content)) as image:
                if image.format not in ("JPEG", "PNG", "WEBP"):
                    raise ValueError("Unsupported image format")

                image = ImageOps.exif_transpose(image)
                image = ImageOps.fit(image, self.IMAGE_SIZE)
                image = image.convert("RGB")

                output = BytesIO()
                image.save(output, format="WEBP", quality=85)

        except (UnidentifiedImageError, OSError, ValueError):
            raise HTTPException(
                status_code=400,
                detail="Invalid image file",
            )

        path = f"{user_id}/{uuid4().hex}.webp"

        self.client.storage.from_(self.bucket).upload(
            path=path,
            file=output.getvalue(),
            file_options={
                "content-type": "image/webp",
            },
        )

        return path

    def delete_avatar(self, path: str) -> None:
        self.client.storage.from_(self.bucket).remove([path])

    def get_avatar_url(self, path: str) -> str:
        response = self.client.storage.from_(self.bucket).create_signed_url(
            path,
            3600,
        )

        return response["signedURL"]
