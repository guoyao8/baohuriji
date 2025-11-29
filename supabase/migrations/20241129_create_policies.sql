-- 启用行级安全
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

-- 授予基本权限
GRANT SELECT ON babies TO anon;
GRANT SELECT ON feeding_records TO anon;
GRANT ALL PRIVILEGES ON babies TO authenticated;
GRANT ALL PRIVILEGES ON feeding_records TO authenticated;
GRANT ALL PRIVILEGES ON families TO authenticated;
GRANT ALL PRIVILEGES ON family_members TO authenticated;
GRANT ALL PRIVILEGES ON reminder_settings TO authenticated;

-- 宝宝表策略 - 用户只能操作自己的宝宝
CREATE POLICY "用户只能查看自己的宝宝" ON babies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的宝宝" ON babies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的宝宝" ON babies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的宝宝" ON babies
    FOR DELETE USING (auth.uid() = user_id);

-- 喂养记录表策略 - 用户只能操作自己的记录
CREATE POLICY "用户只能查看自己的喂养记录" ON feeding_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的喂养记录" ON feeding_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的喂养记录" ON feeding_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的喂养记录" ON feeding_records
    FOR DELETE USING (auth.uid() = user_id);

-- 家庭组表策略 - 用户只能查看自己创建的家庭
CREATE POLICY "用户只能查看自己创建的家庭" ON families
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "用户只能插入自己创建的家庭" ON families
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "用户只能更新自己创建的家庭" ON families
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "用户只能删除自己创建的家庭" ON families
    FOR DELETE USING (auth.uid() = creator_id);

-- 家庭成员表策略 - 用户只能查看自己所在家庭的成员
CREATE POLICY "用户只能查看自己所在家庭的成员" ON family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id