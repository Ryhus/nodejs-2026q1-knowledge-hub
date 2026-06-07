-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'VIEWER';

-- CreateIndex
CREATE INDEX "idx_article_status" ON "Article"("status");

-- CreateIndex
CREATE INDEX "idx_article_categoryId" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "idx_article_status_categoryId" ON "Article"("status", "categoryId");

-- CreateIndex
CREATE INDEX "idx_category_name" ON "Category"("name");

-- CreateIndex
CREATE INDEX "idx_comment_articleId" ON "Comment"("articleId");

-- CreateIndex
CREATE INDEX "idx_comment_authorId" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "idx_tag_name" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "idx_user_login" ON "User"("login");
