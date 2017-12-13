/* Controllers */

angular.module('ploverdojo.wordexplorer', ['ploverdojo.services'])
    .controller('WordExplorerCtrl', ['$scope', 'ControllerSyncService', 'StenoService',
        function (sc, controllerSyncService, stenoService) {

            var KeyStateEnum = {
                None: 0,
                Include: 1,
                Required: 2
            };

            sc.KeyStateLookup = {
                0: 'None',
                1: 'Include',
                2: 'Required'
            };

            // would have put these in an array, but angular wasn't refreshing properly
            sc.Sdash = 0;
            sc.Tdash = 0;
            sc.Kdash = 0;
            sc.Pdash = 0;
            sc.Wdash = 0;
            sc.Hdash = 0;
            sc.Rdash = 0;
            sc.Adash = 0;
            sc.Odash = 0;
            sc.dashE = 0;
            sc.dashU = 0;
            sc.dashF = 0;
            sc.dashR = 0;
            sc.dashP = 0;
            sc.dashB = 0;
            sc.dashL = 0;
            sc.dashG = 0;
            sc.dashT = 0;
            sc.dashS = 0;
            sc.dashD = 0;
            sc.dashZ = 0;
            sc.star  = 0;

            var filter = {};

            sc.init = function() {
                updateFilter();
            };

            sc.buildParamStrings = function () {
                filter.include = '';
                filter.require = '';

                var includeParamStringShouldPrepend = true;
                var requiredParamStringShouldPrepend = true;


                var testExistenceInFilter = function (key, code, isLeftHand) {
                    if (sc.hasOwnProperty(key)) {
                        if (sc[key] === KeyStateEnum.Include) {
                            filter.include += code;

                            if (isLeftHand) {
                                includeParamStringShouldPrepend = false;
                            }
                        }
                        else if (sc[key] === KeyStateEnum.Required) {
                            filter.include += code;
                            filter.require += code;

                            if (isLeftHand) {
                                requiredParamStringShouldPrepend = false;
                            }
                        }
                    }
                };

                // build parameter string

                testExistenceInFilter('Sdash', 'S', true);
                testExistenceInFilter('Tdash', 'T', true);
                testExistenceInFilter('Kdash', 'K', true);
                testExistenceInFilter('Pdash', 'P', true);
                testExistenceInFilter('Wdash', 'W', true);
                testExistenceInFilter('Hdash', 'H', true);
                testExistenceInFilter('Rdash', 'R', true);
                testExistenceInFilter('Adash', 'A', true);
                testExistenceInFilter('Odash', 'O', true);
                testExistenceInFilter('star', '*', true);
                testExistenceInFilter('dashE', 'E', true);
                testExistenceInFilter('dashU', 'U', true);
                testExistenceInFilter('dashF', 'F', false);
                testExistenceInFilter('dashR', 'R', false);
                testExistenceInFilter('dashP', 'P', false);
                testExistenceInFilter('dashB', 'B', false);
                testExistenceInFilter('dashL', 'L', false);
                testExistenceInFilter('dashG', 'G', false);
                testExistenceInFilter('dashT', 'T', false);
                testExistenceInFilter('dashS', 'S', false);
                testExistenceInFilter('dashD', 'D', false);
                testExistenceInFilter('dashZ', 'Z', false);

                if (includeParamStringShouldPrepend && filter.include !== '') {
                    filter.include = '-' + filter.include;
                }

                if (requiredParamStringShouldPrepend && filter.require !== '') {
                    filter.require = '-' + filter.require;
                }

                filter.title = "Custom";
                delete filter.index;

                controllerSyncService.updateCurrentFilter(filter);
            };

            var translateFromSteno = function (code) {
                return code.replace('-', 'dash').replace('*', 'star');
            };

            var updateFilter = function () {

                filter = controllerSyncService.currentFilter;

                // update UI keyboard

                sc.Sdash = 0;
                sc.Tdash = 0;
                sc.Kdash = 0;
                sc.Pdash = 0;
                sc.Wdash = 0;
                sc.Hdash = 0;
                sc.Rdash = 0;
                sc.Adash = 0;
                sc.Odash = 0;
                sc.dashE = 0;
                sc.dashU = 0;
                sc.dashF = 0;
                sc.dashR = 0;
                sc.dashP = 0;
                sc.dashB = 0;
                sc.dashL = 0;
                sc.dashG = 0;
                sc.dashT = 0;
                sc.dashS = 0;
                sc.dashD = 0;
                sc.dashZ = 0;
                sc.star  = 0;

                var keys = [];
                keys = stenoService.expandBrief(filter.include);
                for (var i = 0; i < keys.length; i++) {

                    sc[translateFromSteno(keys[i])] = KeyStateEnum.Include;

                }

                keys = stenoService.expandBrief(filter.require);
                for (var j = 0; j < keys.length; j++) {
                    sc[translateFromSteno(keys[j])] = KeyStateEnum.Required;
                }
            };

            sc.$on('updateFilter', updateFilter);

            sc.customMode = false;
            sc.asterisk = false;

            sc.toggle = function (code) {

                    switch (sc[code]) {
                        case KeyStateEnum.None:
                            sc[code] = KeyStateEnum.Include;
                            break;
                        case KeyStateEnum.Include:
                            sc[code] = KeyStateEnum.Required;
                            break;
                        default:
                            sc[code] = KeyStateEnum.None;
                    }

                sc.buildParamStrings();
            };

            sc.clear = function (codes) {
                for (var i = 0; i < codes.length; i++) {
                    sc[translateFromSteno(codes[i])] = KeyStateEnum.None;
                }
                sc.buildParamStrings();
            };

            sc.include = function (codes) {
                for (var i = 0; i < codes.length; i++) {
                    sc[translateFromSteno(codes[i])] = KeyStateEnum.Include;
                }
                sc.buildParamStrings();

            };

            sc.require = function (codes) {
                for (var i = 0; i < codes.length; i++) {
                    sc[translateFromSteno(codes[i])] = KeyStateEnum.Required;
                }
                sc.buildParamStrings();

            };


        }
    ])
;




