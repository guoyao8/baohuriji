-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建宝宝档案表
CREATE TABLE IF NOT EXISTS babies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('男', '女')),
    birth_date DATE NOT NULL,
    avatar_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_twins BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建喂养记录表
CREATE TABLE IF NOT EXISTS feeding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('母乳', '配方奶', '辅食')),
    amount_ml INTEGER,
    amount_kg DECIMAL(5,2),
    duration_seconds INTEGER,
    breast_side VARCHAR(10) CHECK (breast_side IN ('左', '右', '无')),
    feeding_time TIMESTAMP WITH TIME ZONE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建家庭组表
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建家庭成员表
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('管理员', '家庭成员')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- 创建提醒设置表
CREATE TABLE IF NOT EXISTS reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    scope VARCHAR(10) NOT NULL CHECK (scope IN ('统一', 'A', 'B')),
    is_enabled BOOLEAN DEFAULT true,
    interval_hours INTEGER DEFAULT 3,
    interval_minutes INTEGER DEFAULT 0,
    reminder_type VARCHAR(20) DEFAULT '震动和铃声' CHECK (reminder_type IN ('震动', '铃声', '震动和铃声')),
    ringtone VARCHAR(50) DEFAULT '默认',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(baby_id, scope)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_babies_user_id ON babies(user_id);
CREATE INDEX IF NOT EXISTS idx_babies_sort_order ON babies(sort_order);
CREATE INDEX IF NOT EXISTS idx_feeding_records_baby_id ON feeding_records(baby_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_user_id ON feeding_records(user_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_feeding_time ON feeding_records(feeding_time DESC);
CREATE INDEX IF NOT EXISTS idx_feeding_records_record_type ON feeding_records(record_type);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_settings_baby_id ON reminder_settings(baby_id);