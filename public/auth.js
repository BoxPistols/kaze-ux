/**
 * SDPF Theme - 簡易認証スクリプト
 *
 * 静的サイト用の簡易認証機能（prompt使用）
 * - ブラウザ標準のpromptでパスワード入力
 * - LocalStorageに認証状態を保存
 * - 30日間有効
 *
 * 注意: これはクライアントサイドのみの簡易認証です。
 * 機密性の高いコンテンツの保護には適していません。
 * デザイン検証用プレビューサイトのカジュアルな保護を目的としています。
 */
/**
 * 【注意: prompt()利用の制約事項】
 * - パスワードがブラウザの履歴やオートコンプリートに残る可能性があります
 * - promptダイアログはスタイル変更できず、サイトのデザインと一致しません
 * - 一部のブラウザ拡張や自動化ツールがpromptに干渉する場合があります
 * 上記の理由から、この実装は本番用途や高いセキュリティ要件には適しません
 */
;(function () {
  'use strict'

  // 設定
  var CONFIG = {
    // パスワード（GitHub Secretsで環境変数として設定することを推奨）
    // ビルド時に __AUTH_PASSWORD__ が置換される
    password: '__AUTH_PASSWORD__',
    // 認証状態を保存するキー
    storageKey: 'sdpf_auth',
    // 30日間の有効期限（ミリ秒）
    expiryDuration: 30 * 24 * 60 * 60 * 1000,
  }

  // 簡易ハッシュ関数（PasswordGateと同じロジック）
  function simpleHash(str) {
    var hash = 0
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  // 認証済みかチェック
  function isAuthenticated() {
    try {
      var authData = localStorage.getItem(CONFIG.storageKey)
      if (!authData) return false

      var data = JSON.parse(authData)

      // 有効期限チェック
      if (!data.expiry || Date.now() >= data.expiry) {
        // 期限切れの場合は認証情報を削除
        localStorage.removeItem(CONFIG.storageKey)
        return false
      }

      // パスワードハッシュの検証（PasswordGateと互換性を持たせる）
      var currentPasswordHash = simpleHash(CONFIG.password)
      if (data.passwordHash && data.passwordHash !== currentPasswordHash) {
        localStorage.removeItem(CONFIG.storageKey)
        return false
      }

      return data.authenticated === true
    } catch (e) {
      return false
    }
  }

  // 認証状態を保存（30日間有効）
  function saveAuth() {
    var data = {
      authenticated: true,
      timestamp: Date.now(),
      expiry: Date.now() + CONFIG.expiryDuration,
      // PasswordGateと互換性を持たせるためpasswordHashを保存
      passwordHash: simpleHash(CONFIG.password),
    }
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(data))
  }

  // 認証処理（シンプルなprompt使用）
  function showAuthDialog() {
    var maxAttempts = 3
    var attempts = 0

    while (attempts < maxAttempts) {
      var input = window.prompt(
        'SDPF Theme Preview\n\nパスワードを入力してください:',
        ''
      )

      // キャンセルされた場合
      if (input === null) {
        document.body.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f5f5f5;">' +
          '<div style="text-align:center;">' +
          '<h1 style="color:#333;margin-bottom:1rem;">アクセスが拒否されました</h1>' +
          '<p style="color:#666;">このページを表示するには認証が必要です。</p>' +
          '<button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1rem;cursor:pointer;">再試行</button>' +
          '</div></div>'
        return false
      }

      // パスワードチェック
      if (input === CONFIG.password) {
        saveAuth()
        return true
      }

      attempts++
      // 試行回数超過前は次のpromptで再入力を促す（alertは表示しない）
    }

    // 試行回数超過
    document.body.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f5f5f5;">' +
      '<div style="text-align:center;">' +
      '<h1 style="color:#d32f2f;margin-bottom:1rem;">認証失敗</h1>' +
      '<p style="color:#666;">試行回数の上限に達しました。</p>' +
      '<button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1rem;cursor:pointer;">再試行</button>' +
      '</div></div>'
    return false
  }

  // 認証ダイアログ関数をグローバルに公開（検証用）
  window.showAuthDialog = showAuthDialog

  // ログアウト機能（開発者コンソールから呼び出し可能）
  window.sdpfLogout = function () {
    localStorage.removeItem(CONFIG.storageKey)
    location.reload()
  }

  // メイン処理
  function init() {
    // パスワードが未設定またはビルド時置換されていない場合は認証をスキップ
    if (CONFIG.password === '__AUTH_PASSWORD__' || CONFIG.password === '') {
      return
    }

    if (!isAuthenticated()) {
      showAuthDialog()
    }
  }

  init()
})()
