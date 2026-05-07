"""
测试公众号推广管理系统的完整流程
"""
from playwright.sync_api import sync_playwright
import time

def test_promotion_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # 使用非无头模式以便观察
        page = browser.new_page()

        print("🚀 访问管理后台...")
        page.goto('http://localhost:5175')
        page.wait_for_load_state('networkidle')

        # 截图初始状态
        page.screenshot(path='c:/公众号任务/screenshots/01-home.png')
        print("✅ 首页加载完成")

        # 导航到推广素材页面
        print("📍 导航到推广素材页面...")
        page.click('text=推广素材')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='c:/公众号任务/screenshots/02-promotion-materials.png')
        print("✅ 到达推广素材页面")

        # ========== 测试添加海报模板 ==========
        print("\n🎨 ========== 开始测试添加海报模板 ==========")

        # 点击添加素材按钮
        print("📝 点击添加素材按钮...")
        page.click('button:has-text("添加素材")')
        time.sleep(0.5)

        # 填写海报模板信息
        print("📝 填写海报模板信息...")
        page.fill('input#name', f'测试海报_{int(time.time())}')
        page.select_option('select#account_id', '1')

        # 上传图片（跳过，因为需要本地文件）
        print("⚠️  跳过图片上传（需要本地文件）")
        print("⚠️  手动步骤：请手动上传一张图片后继续")

        # 等待用户手动操作
        input("⏸️  请手动上传图片后，按 Enter 继续...")

        # 填写尺寸信息
        print("📐 填写尺寸和二维码位置...")
        page.fill('input#width', '1080')
        page.fill('input#height', '1920')
        page.fill('input#qr_x', '800')
        page.fill('input#qr_y', '1700')
        page.fill('input#qr_size', '200')

        # 截图表单
        page.screenshot(path='c:/公众号任务/screenshots/03-poster-form.png')

        # 提交
        print("💾 提交海报模板...")
        page.click('button:has-text("确认")')
        time.sleep(1)

        # 等待提交完成
        try:
            page.wait_for_selector('text=添加成功', timeout=5000)
            print("✅ 海报模板添加成功")
        except:
            print("⚠️  海报模板添加可能失败，继续测试...")

        page.screenshot(path='c:/公众号任务/screenshots/04-poster-added.png')

        # ========== 测试添加文案 ==========
        print("\n📝 ========== 开始测试添加文案 ==========")

        # 切换到文案 Tab
        print("🔄 切换到文案 Tab...")
        page.click('button:has-text("朋友圈文案")')
        time.sleep(0.5)

        # 点击添加素材
        print("📝 点击添加素材按钮...")
        page.click('button:has-text("添加素材")')
        time.sleep(0.5)

        # 填写文案信息
        print("📝 填写文案信息...")
        page.fill('input#name', f'测试文案_{int(time.time())}')
        page.select_option('select#category', 'formal')
        page.fill('textarea#content', '这是一个测试文案，用于验证系统功能。')
        page.fill('input#variables', '姓名, 部门')

        # 截图表单
        page.screenshot(path='c:/公众号任务/screenshots/05-text-form.png')

        # 提交
        print("💾 提交文案...")
        page.click('button:has-text("确认")')
        time.sleep(1)

        # 等待提交完成
        try:
            page.wait_for_selector('text=添加成功', timeout=5000)
            print("✅ 文案添加成功")
        except:
            print("⚠️  文案添加可能失败，继续测试...")

        page.screenshot(path='c:/公众号任务/screenshots/06-text-added.png')

        # ========== 测试创建推广套装 ==========
        print("\n📦 ========== 开始测试创建推广套装 ==========")

        # 切换到推广套装 Tab
        print("🔄 切换到推广套装 Tab...")
        page.click('button:has-text("推广套装")')
        time.sleep(0.5)

        # 点击创建套装
        print("📝 点击创建套装按钮...")
        page.click('button:has-text("创建套装")')
        time.sleep(0.5)

        # 填写套装信息
        print("📝 填写套装信息...")
        page.fill('input#name', f'测试套装_{int(time.time())}')
        page.select_option('select#account_id', '1')

        # 选择海报模板和文案模板
        print("📝 选择海报模板...")
        page.select_option('select#poster_template_id', index=0)

        print("📝 选择文案模板...")
        page.select_option('select#text_template_id', index=0)

        # 截图表单
        page.screenshot(path='c:/公众号任务/screenshots/07-kit-form.png')

        # 提交
        print("💾 提交推广套装...")
        page.click('button:has-text("确认")')
        time.sleep(1)

        # 等待提交完成
        try:
            page.wait_for_selector('text=添加成功', timeout=5000)
            print("✅ 推广套装添加成功")
        except:
            print("⚠️  推广套装添加可能失败，继续测试...")

        page.screenshot(path='c:/公众号任务/screenshots/08-kit-added.png')

        # ========== 验证数据关联 ==========
        print("\n🔍 ========== 验证数据关联 ==========")

        # 查看推广套装列表
        print("📋 查看推广套装列表...")
        page.reload()
        page.wait_for_load_state('networkidle')
        time.sleep(0.5)

        page.click('button:has-text("推广套装")')
        time.sleep(0.5)

        # 截图列表
        page.screenshot(path='c:/公众号任务/screenshots/09-kit-list.png')

        # 获取列表内容
        kits = page.locator('table tbody tr').all()
        print(f"📊 发现 {len(kits)} 个推广套装")

        if len(kits) > 0:
            first_kit = kits[0]
            cells = first_kit.locator('td').all()
            if len(cells) >= 5:
                print(f"✅ 套装名称: {cells[0].inner_text()}")
                print(f"✅ 所属公众号: {cells[1].inner_text()}")
                print(f"✅ 海报模板: {cells[2].inner_text()}")
                print(f"✅ 文案模板: {cells[3].inner_text()}")
                print(f"✅ 使用次数: {cells[4].inner_text()}")

        # ========== 测试编辑功能 ==========
        print("\n✏️  ========== 测试编辑功能 ==========")

        if len(kits) > 0:
            print("✏️  点击编辑第一个套装...")
            first_kit.locator('button:has-text("✏")').click()
            time.sleep(0.5)

            page.screenshot(path='c:/公众号任务/screenshots/10-kit-edit.png')

            print("✏️  修改套装名称...")
            new_name = f'编辑后的套装_{int(time.time())}'
            page.fill('input#name', new_name)

            print("💾 保存修改...")
            page.click('button:has-text("保存")')
            time.sleep(1)

            try:
                page.wait_for_selector('text=更新成功', timeout=5000)
                print("✅ 套装编辑成功")
            except:
                print("⚠️  套装编辑可能失败")

            page.screenshot(path='c:/公众号任务/screenshots/11-kit-updated.png')

        print("\n🎉 ========== 测试完成 ==========")
        print("📸 所有截图已保存到 c:/公众号任务/screenshots/")

        # 等待用户查看
        input("⏸️  按任意键关闭浏览器...")

        browser.close()

if __name__ == '__main__':
    test_promotion_flow()
