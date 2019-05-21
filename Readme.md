# midterm_pitchshifter

# About
一個可以改變音高跟速度的音樂播放器。

# Functions
- Upload 頁面：
在 Upload 頁面下上傳音檔，支援 drag n drop 上傳。

- Music 頁面：
	- 可以選擇任一已上傳的音檔播放
	- 可以調整音高
	- 可以調整速度
	- 可以調整目前播放位置

# How to execute
`npm install`
`npm start`
go to `localhost:3000` to view the website

# 注意事項
目前僅保證支援 Google Chrome


# Reference
前端 React.js
後端 Express.js

音高與速度控制部分主要來自這個 single-page 的 repo:
`https://github.com/dumbmatter/screw`
有修改一些原 code 的 syncronize problem（原本執行不起來，但也有可能是我的問題）
它有使用 SoundTouch JS audio processing library 這個開源的 library

# 我的貢獻
1. debugggg QQ
2. 支援多個音檔切換

# 心得
練團時有感於如果定key跟原曲不一樣的話，要對照原曲或跟著原曲練習都比較麻煩，因此想要做一個具有改變音樂音高跟速度功能的網頁。
原本想要接 Mongodb，但在把音樂存進 db 的時候遇到障礙，只好暫時先放棄，以後可以繼續研究。


