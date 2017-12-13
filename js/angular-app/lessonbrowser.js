/* Controllers */
angular.module('ploverdojo.lessonbrowser', ['ploverdojo.services', 'ploverdojo.wordexplorer', 'ngCookies'])
    .controller('LessonBrowserCtrl', ['$scope', '$location', '$cookies', 'LessonService', 'ControllerSyncService', 'UserDataService',
        function (sc, location, cookies, lessonService, controllerSyncService, userDataService) {

            sc.init = function () {

                loadSections(true);
            };

            sc.currentFilter = {};

            sc.currentSection = {};

            sc.history = userDataService.getFilterHistory(sc);

            sc.sections = [];

            sc.getSection = function (index) {
                cookies.currentSection = index;
                sc.currentSection = sc.sections[index];
            };

            var loadSections = function (initWithCookies) {
                var allSections = {};

                lessonService.getLessons(function (data, status, headers, config) {
                    allSections = data;

                    for (var i = 1; i <= 6; i++) {

                        var section = {};
                        section.lessons = lessonService.filter('group-' + i, allSections);
                        section.title = "Steno Tour part " + i;
                        section.index = i - 1;
                        sc.sections.push(section);
                    }

                    if(initWithCookies) {

                        sc.currentSection = sc.sections[parseInt(cookies.currentSection, 10)];

                        if (cookies.currentFilter) {
                            sc.loadFilter(JSON.parse(cookies.currentFilter), sc.currentSection);
                        }
                    };

                });
            };


            sc.loadFilter = function (filter, section, index) {
                if (index !== undefined) {
                    filter.index = index;
                }
                if (section) {
                    sc.currentSection = section;
                    cookies.currentSection = section.index + "";
                }
                sc.currentFilter = filter;
                controllerSyncService.updateCurrentFilter(filter);
                cookies.currentFilter = JSON.stringify(filter);
                location.path(filter.title);
            };

            sc.isActiveFilter = function (title) {
                return title === location.path().substring(1, location.path().length);
            };


        }
    ])
;




