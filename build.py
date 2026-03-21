"""
读取 projects/ 目录下所有 YAML 文件，生成 js/projects-data.js。

YAML 字段说明：
  - name:        项目名称（必填）
  - description: 项目描述（必填）
  - technology:  技术栈，用中文顿号或英文逗号分隔（必填）
  - result:      成果/成绩（可选，缺省则不展示）
  - bilibili:    Bilibili 视频 BV 号（可选，优先于本地视频）

若提供 bilibili 字段则使用 Bilibili 嵌入播放器，
否则同名 .mp4 文件会自动关联为演示视频。

用法：python build.py
"""

import json
import os
import glob

try:
    import yaml
except ImportError:
    print("Missing PyYAML, installing...")
    os.system("pip install pyyaml")
    import yaml

PROJECTS_DIR = os.path.join(os.path.dirname(__file__), "projects")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "js", "projects-data.js")


def parse_tech(raw: str) -> list[str]:
    for sep in ["、", "，", ","]:
        if sep in raw:
            return [t.strip() for t in raw.split(sep) if t.strip()]
    return [raw.strip()] if raw.strip() else []


def build():
    yaml_files = sorted(glob.glob(os.path.join(PROJECTS_DIR, "*.yaml")))

    if not yaml_files:
        print("[WARN] No YAML files found in projects/")
        return

    projects = []
    for path in yaml_files:
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        slug = os.path.splitext(os.path.basename(path))[0]
        video_path = os.path.join(PROJECTS_DIR, f"{slug}.mp4")
        has_video = os.path.exists(video_path)

        bilibili = data.get("bilibili")

        project = {
            "slug": slug,
            "name": data.get("name", slug),
            "description": data.get("description", ""),
            "technology": parse_tech(data.get("technology", "")),
            "bilibili": bilibili if bilibili else None,
            "video": f"projects/{slug}.mp4" if has_video and not bilibili else None,
        }

        result = data.get("result")
        if result:
            project["result"] = result

        projects.append(project)

    js_content = (
        "/* 由 build.py 自动生成，请勿手动编辑 */\n"
        "var PROJECT_DATA = " + json.dumps(projects, ensure_ascii=False, indent=2) + ";\n"
    )

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)

    print("[OK] Generated: " + OUTPUT_FILE)
    for p in projects:
        if p["bilibili"]:
            media_flag = "[bili] "
        elif p["video"]:
            media_flag = "[video]"
        else:
            media_flag = "       "
        result_flag = " | " + p.get("result", "") if "result" in p else ""
        print("  " + media_flag + " " + p["name"] + result_flag)


if __name__ == "__main__":
    build()
