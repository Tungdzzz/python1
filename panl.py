import tkinter as tk
from tkinter import simpledialog, messagebox, scrolledtext
import subprocess
import threading
import time

# Mặc định
DEFAULT_RATE = "65"
DEFAULT_THREAD = "5"
DEFAULT_PROXY = "prx.txt"

# Thông tin tài khoản và mật khẩu
USER_CREDENTIALS = {"tungdzvcl": "tung2007"}

# Hàm gọi sms
def send_sms(number, send_count):
    try:
        # Chạy smsv2.py với số điện thoại và số lần gửi
        cmd = ['python3', 'smsv2.py', number, str(send_count)]
        subprocess.run(cmd, check=True)
        log_box.insert(tk.END, f"[SMS] Tin nhắn đã gửi đến {number}, gửi {send_count} lần.\n")
    except subprocess.CalledProcessError as e:
        log_box.insert(tk.END, f"[LỖI SMS] {e}\n")

def start_attack():
    # Nhập thông tin từ người dùng
    target = simpledialog.askstring("Nhập Web Target", "Nhập domain (VD: tung.com):")
    time_val = simpledialog.askstring("Nhập Thời Gian", "Nhập thời gian chạy (giây):")

    if not target or not time_val:
        messagebox.showwarning("Thiếu thông tin", "Bạn phải nhập target và thời gian.")
        return

    # Thời gian bắt đầu
    start_time = time.strftime("%H:%M:%S", time.localtime())

    # Cập nhật thông tin tấn công
    log_box.delete(1.0, tk.END)
    log_box.insert(tk.END, f"[HTT] Bắt đầu tấn công vào {start_time}...\n")
    log_box.insert(tk.END, f"[HTT] Tấn công {target} trong {time_val}s...\n")
    log_box.insert(tk.END, f"[HTT] Sử dụng rate={DEFAULT_RATE}, thread={DEFAULT_THREAD}, proxy={DEFAULT_PROXY}\n")

    # Cập nhật thông tin trên GUI
    attack_info_label.config(text=f"Tấn công: {target} | Thời gian: {time_val} giây")

    def run():
        try:
            # Tấn công web
            cmd = ['node', 'kill.js', target, time_val, DEFAULT_RATE, DEFAULT_THREAD, DEFAULT_PROXY]
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in process.stdout:
                log_box.insert(tk.END, line)
                log_box.see(tk.END)
            process.wait()
            log_box.insert(tk.END, f"\n[HTT] Tấn công hoàn tất lúc {time.strftime('%H:%M:%S', time.localtime())}.")
        except Exception as e:
            log_box.insert(tk.END, f"\n[LỖI] {str(e)}")

    # Chạy trong thread riêng để không làm gián đoạn giao diện
    threading.Thread(target=run).start()

def start_spam():
    # Nhập thông tin từ người dùng
    number = simpledialog.askstring("Nhập số điện thoại", "Nhập số điện thoại (10 chữ số):")
    if not number or len(number) != 10:
        messagebox.showwarning("Số điện thoại không hợp lệ", "Vui lòng nhập đúng số điện thoại 10 chữ số.")
        return

    send_count = simpledialog.askinteger("Nhập số lần gửi SMS", "Nhập số lần gửi SMS (tối đa 20):", minvalue=1, maxvalue=20)
    if not send_count:
        send_count = 1  # Mặc định là gửi 1 lần nếu không nhập

    log_box.delete(1.0, tk.END)
    log_box.insert(tk.END, f"[SPAM] Đang gửi SMS đến {number}...\n")

    # Gửi SMS
    send_sms(number, send_count)

# Giao diện đăng nhập
def login_window():
    def login():
        username = username_entry.get()
        password = password_entry.get()

        if username in USER_CREDENTIALS and USER_CREDENTIALS[username] == password:
            login_frame.pack_forget()  # Ẩn cửa sổ đăng nhập
            main_window()  # Hiển thị giao diện chính
        else:
            messagebox.showerror("Sai thông tin đăng nhập", "Tài khoản hoặc mật khẩu không đúng.")

    # Tạo cửa sổ đăng nhập
    login_win = tk.Tk()
    login_win.title("Đăng nhập")
    login_win.geometry("400x300")
    login_win.configure(bg="#2C2F3F")

    # Tạo Frame đăng nhập
    login_frame = tk.Frame(login_win, bg="#2C2F3F")
    login_frame.pack(fill="both", expand=True, padx=10, pady=10)

    # Font chữ đẹp và hiện đại
    FONT_LABEL = ("Arial", 16, "bold")
    FONT_ENTRY = ("Arial", 14)

    tk.Label(login_frame, text="Tài Khoản", font=FONT_LABEL, fg="white", bg="#2C2F3F").pack(pady=10)
    username_entry = tk.Entry(login_frame, font=FONT_ENTRY)
    username_entry.pack(pady=10)

    tk.Label(login_frame, text="Mật Khẩu", font=FONT_LABEL, fg="white", bg="#2C2F3F").pack(pady=10)
    password_entry = tk.Entry(login_frame, font=FONT_ENTRY, show="*")
    password_entry.pack(pady=10)

    login_button = tk.Button(login_frame, text="Đăng Nhập", font=("Arial", 14), command=login)
    login_button.pack(pady=20)

    login_win.mainloop()

# Giao diện chính
def main_window():
    window = tk.Tk()
    window.title("HTT ATTACK PANEL")
    window.geometry("800x800")
    window.configure(bg="#2C2F3F")

    # Tạo Menu
    menu_bar = tk.Menu(window)
    window.config(menu=menu_bar)

    # Tạo menu "Tools"
    tools_menu = tk.Menu(menu_bar, tearoff=0)
    menu_bar.add_cascade(label="Tools", menu=tools_menu)
    tools_menu.add_command(label="METHODS", command=start_attack)
    tools_menu.add_command(label="SPAM", command=start_spam)

    # Frame cho giao diện chính
    frame = tk.Frame(window, bg="#2C2F3F")
    frame.pack(fill="both", expand=True, padx=10, pady=10)

    # Font chữ đẹp và hiện đại
    FONT_TITLE = ("Arial", 36, "bold")
    FONT_BUTTON = ("Arial", 18, "bold")
    FONT_LOG = ("Courier New", 12)
    FONT_INFO = ("Arial", 14, "bold")

    # Chữ HTT lớn
    tk.Label(frame, text="HTT", font=FONT_TITLE, fg="#00FF99", bg="#2C2F3F").pack(pady=20)

    # Thông tin Tấn công (Hiển thị web và thời gian tấn công)
    attack_info_label = tk.Label(frame, text="Tấn công: Chưa bắt đầu", font=FONT_INFO, fg="#FF0033", bg="#2C2F3F")
    attack_info_label.pack(pady=10)

    # Frame cho các nút
    button_frame = tk.Frame(frame, bg="#2C2F3F")
    button_frame.pack(pady=20)

    # Frame cho Log
    log_frame = tk.Frame(frame, bg="#2C2F3F")
    log_frame.pack(fill="both", expand=True, pady=20)

    # Log hiển thị kết quả
    global log_box
    log_box = scrolledtext.ScrolledText(log_frame, height=15, font=FONT_LOG, bg="#1E1E1E", fg="lime", insertbackground="white", wrap=tk.WORD)
    log_box.pack(padx=20, pady=10, fill=tk.BOTH, expand=True)

    window.mainloop()

# Gọi hàm đăng nhập khi chạy ứng dụng
login_window()
