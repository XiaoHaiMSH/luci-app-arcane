'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getRunning() {
	return L.resolveDefault(callServiceList('arcane'), {}).then(function (res) {
		try {
			return res['arcane']['instances']['arcane']['running'] === true;
		} catch (e) {
			return false;
		}
	});
}

function renderStatus(running, port) {
	if (!running)
		return '<em><span style="color:red"><strong>Arcane 未运行</strong></span></em>';

	var url = 'http://' + window.location.hostname + ':' + port;

	return '<em><span style="color:green"><strong>Arcane 运行中</strong></span></em>' +
		' &nbsp;<a class="btn cbi-button cbi-button-apply" target="_blank" rel="noreferrer" href="' + url + '">打开面板</a>';
}

return view.extend({
	load: function () {
		return uci.load('arcane');
	},

	render: function () {
		var m, s, o;

		m = new form.Map('arcane', 'Arcane 容器管理',
			'Arcane 是一个现代化的 Docker 管理面板，支持容器、镜像、网络、存储卷以及 Compose 项目管理。' +
			'使用前请先安装并启动 Docker（dockerd）。首次登录的默认账号请参考 Arcane 官方文档。');

		/* 运行状态 */
		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function () {
				return getRunning().then(function (running) {
					var el = document.getElementById('arcane_status');
					if (el)
						el.innerHTML = renderStatus(running, uci.get('arcane', 'main', 'port') || '3552');
				});
			});

			return E('div', { 'class': 'cbi-section' }, [
				E('p', { 'id': 'arcane_status' }, '正在获取运行状态…')
			]);
		};

		/* 基本设置 */
		s = m.section(form.NamedSection, 'main', 'arcane', '基本设置');
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', '启用');
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.Value, 'port', '监听端口');
		o.datatype = 'port';
		o.default = '3552';
		o.rmempty = false;

		o = s.option(form.Value, 'listen', '监听地址');
		o.datatype = 'ipaddr';
		o.placeholder = '0.0.0.0';
		o.description = '留空表示监听所有地址；仅本机访问（配合反向代理）可填 127.0.0.1。';

		o = s.option(form.Value, 'app_url', '访问地址（APP_URL）');
		o.placeholder = 'http://路由器LAN地址:端口';
		o.description = '留空则自动使用 LAN 地址加端口。通过域名或反向代理访问时，请填写实际访问地址，否则可能出现登录或跨域校验失败。';

		o = s.option(form.Value, 'data_dir', '数据目录');
		o.default = '/opt/arcane';
		o.rmempty = false;
		o.description = '保存数据库、Compose 项目等数据。建议放在外置存储上，避免频繁写入路由器闪存。';

		o = s.option(form.Value, 'docker_host', 'Docker 地址');
		o.default = 'unix:///var/run/docker.sock';
		o.rmempty = false;
		o.description = '默认使用本机 dockerd 的 socket。';

		/* 安全密钥 */
		s = m.section(form.NamedSection, 'main', 'arcane', '安全密钥');
		s.addremove = false;

		o = s.option(form.Value, 'encryption_key', '加密密钥（ENCRYPTION_KEY）');
		o.password = true;
		o.description = '留空则首次启动时自动生成。注意：修改后，已加密保存的数据将无法解密，请勿随意更改。';

		o = s.option(form.Value, 'jwt_secret', 'JWT 密钥（JWT_SECRET）');
		o.password = true;
		o.description = '留空则首次启动时自动生成。修改后所有已登录会话将失效。';

		return m.render();
	}
});
