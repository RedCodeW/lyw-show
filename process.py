from moviepy import VideoFileClip
import os

def extreme_compress(input_path, output_path, target_width=640, fps=10, crf=32):
    """
    极限压缩脚本
    :param target_width: 宽度建议 640 或 480 (项目主页演示够用了)
    :param fps: 抽帧到每秒 10 帧 (大幅减小体积)
    :param crf: 质量因子，32-35 压缩率极高，画面会有轻微噪点但体积很小
    """
    try:
        if not os.path.exists(input_path):
            print("找不到输入文件，请检查路径。")
            return

        with VideoFileClip(input_path) as clip:
            # 1. 降低分辨率：宽度设为 640，高度自动按比例缩放
            new_clip = clip.resized(width=target_width) if clip.w > target_width else clip
            
            # 2. 导出设置
            # fps=fps 实现抽帧
            # audio=False 移除音轨 (省下不少空间)
            # ffmpeg_params 使用 CRF 模式让编译器根据画面复杂度动态分配空间，而不是死板的 800k
            new_clip.write_videofile(
                output_path,
                fps=fps,
                codec='libx264',
                audio=False,
                threads=4,
                ffmpeg_params=['-crf', str(crf), '-preset', 'slower']
            )

        origin_size = os.path.getsize(input_path) / 1024
        final_size = os.path.getsize(output_path) / 1024
        print(f"\n✅ 处理完成！")
        print(f"原始大小: {origin_size:.2f} KB")
        print(f"压缩后大小: {final_size:.2f} KB (约 {final_size/1024:.2f} MB)")
        print(f"压缩比: {final_size/origin_size:.1%}")

    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == "__main__":
    # 请确保路径正确
    input_file = r"D:\WorkSpace\Web\lyw-show\project\langvggt.mp4"
    output_file = "compressed_web.mp4"

    extreme_compress(
        input_path=input_file,
        output_path=output_file,
        target_width=640,  # 如果还嫌大，可以改成 480
        fps=12,            # 抽帧到 12 帧
        crf=32             # 调高这个值（最高51）可以进一步缩小体积
    )