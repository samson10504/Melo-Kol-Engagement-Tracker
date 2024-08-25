-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "kol_id" INTEGER NOT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL,
    "counts" JSONB NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kol" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,

    CONSTRAINT "Kol_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_kol_id_fkey" FOREIGN KEY ("kol_id") REFERENCES "Kol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
