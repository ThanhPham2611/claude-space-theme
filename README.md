# Space Theme

Theme vũ trụ cho Claude Code, chỉ có chế độ tối. Phía sau cuộc trò chuyện là một dải ngân hà chéo màn hình với lõi sáng ấm và bụi tối, khoảng 220 ngôi sao lấp lánh, vài vệt sao băng thỉnh thoảng lướt qua, và một hệ mặt trời nhỏ ở góc trên phải với tám hành tinh đang quay. Các panel của app được làm mờ kính phía trên nền để chữ vẫn dễ đọc.

Mọi hiệu ứng chạy cục bộ bằng CSS trong một ảnh SVG, không gọi model nên không tốn token. Nếu hệ điều hành bật "giảm chuyển động", mọi hiệu ứng tự dừng.

## Cài đặt

Trong terminal Claude Code, gõ dòng sau rồi trả lời `y` để thêm marketplace và chọn phạm vi cài:

```
/plugin install space-theme --marketplace ThanhPham2611/claude-space-theme
```

Từ shell:

```
claude plugin install space-theme --marketplace ThanhPham2611/claude-space-theme
```

Trong app desktop, nơi `/plugin` không chạy: bấm `+` cạnh ô nhập, chọn Plugins, Add marketplace với `ThanhPham2611/claude-space-theme`, rồi Add plugin.

Chạy thử từ bản tải về, không cần cài: `claude --plugin-dir ./claude-space-theme`.

## Lưu ý

- Chỉ app desktop và mobile vẽ theme. Terminal và VS Code không vẽ, nên ở đó mod không làm gì.
- Mỗi lúc chỉ có một theme có hiệu lực: theme nào đặt sau thì thắng. Cài thêm mod theme khác thì chúng đè lên nhau.
- Trên cửa sổ rất hẹp hoặc điện thoại, hệ mặt trời bị cắt ở mép. Dải ngân hà và sao vẫn hiện đủ.
- Mod chạy không có sandbox và Anthropic không duyệt. Đọc mã trong `hooks/` trước khi cài.
- Đã thử trên Claude Code 2.1.325.

## Chỉnh theo ý bạn

- Màu: các giá trị `anchors` và `roles` trong `hooks/register.tsx`.
- Độ mờ kính của panel: `glass` cũng trong `hooks/register.tsx`.
- Cảnh nền (số sao, tốc độ, hành tinh): `hooks/scene.js`.

## Phát triển

```
claude --plugin-dir .       # nạp mod, sửa là tự nạp lại
claude plugin validate .
claude plugin test .
```

`hooks/make-colors.js` là bộ dựng bảng màu đi kèm bộ công cụ viết mod, giữ nguyên, không sửa.

## Giấy phép

MIT, xem [LICENSE](LICENSE).
