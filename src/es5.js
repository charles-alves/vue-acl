"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Acl = function () {
	function Acl() {
		_classCallCheck(this, Acl);
	}

	_createClass(Acl, [{
		key: 'init',
		value: function init(router, permission) {
			this.router = router;
			this.permission = permission;
		}
	}, {
		key: 'check',
		value: function check(permission) {
			if (typeof permission != 'undefined') permission = permission.indexOf('|') !== -1 ? permission.split('|') : permission;

			if (Array.isArray(permission)) return permission.indexOf(this.permission) !== -1 ? true : false;else return this.permission == permission;
		}
	}, {
		key: 'createCliLink',
		value: function createCliLink() {
			var _this = this;
			return {
				name: 'cli-link',
				props: {
					to: {
						type: String,
						required: true
					},
					routerConfig: {
						type: Object
					}
				},
				methods: {
					getLinkPermissions: function getLinkPermissions(link) {
						var router = this.$router.resolve(link);
						if (router) {
							return router.resolved.meta.permission;
						}

						return null;
					}
				},
				computed: {
					options: function options() {
						return {
							props: _extends({}, this.routerConfig, {
								to: this.to
							}) };
					}
				},
				render: function render(createElement) {
					var permissions = this.getLinkPermissions(this.options.props.to);

					if (_this.check(permissions)) {
						return createElement('router-link', this.options, this.$slots.default);
					}

					return null;
				}
			};
		}
	}, {
		key: 'router',
		set: function set(router) {
			var _this2 = this;

			router.beforeEach(function (to, from, next) {
				var fail = to.meta.fail || '/';
				if (typeof to.meta.permission == 'undefined') return next(fail);else {
					if (!_this2.check(to.meta.permission)) return next(fail);
					next();
				}
			});
		}
	}]);

	return Acl;
}();

var acl = new Acl();

Acl.install = function (Vue, _ref) {
	var router = _ref.router,
	    init = _ref.init;


	acl.init(router, init);

	Vue.prototype.$can = function (permission) {
		return acl.check(permission);
	};

	Vue.prototype.$access = function () {
		var newAccess = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

		if (newAccess != null) acl.permission = newAccess;else return acl.permission;
	};

	Vue.component('cli-link', acl.createCliLink());
};

exports.default = Acl;
