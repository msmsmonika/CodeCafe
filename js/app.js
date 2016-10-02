(function () {
    var app = angular.module("codeCafe", []);
    var codeInfoList = [];
    var mydb = openDatabase("codes_db3", "0.1", "List of codes", 1024 * 1024);
    app.controller('CodeCafeListController', ['$http', '$scope', '$filter', function ($http, $scope, $filter) {
        $scope.CodeList = [];
        $scope.currentPageVal = 1;
        $scope.searchString = '';
        $scope.totalCount = 0;
        $scope.pagination = [];
        $scope.DoNext = function (val) {
            if (val == 0) {
                if ($scope.currentPageVal >= 100) {} else {
                    $scope.currentPageVal = $scope.currentPageVal + 1;
                    $scope.pagination = [];
                    for (var t = 1; t <= 10; t++) {
                        if (t == $scope.currentPageVal) {
                            var page = {
                                isActive: true,
                                pageNumber: t
                            }
                            $scope.pagination.push(page);
                            //$scope.$apply();
                        } else {
                            var page = {
                                isActive: false,
                                pageNumber: t
                            }
                            $scope.pagination.push(page);
                            // $scope.$apply();
                        }
                    }
                }
            } else {
                $scope.currentPageVal = val;
                $scope.pagination = [];
                for (var t = 1; t <= 10; t++) {
                    if (t == $scope.currentPageVal) {
                        var page = {
                            isActive: true,
                            pageNumber: t
                        }
                        $scope.pagination.push(page);
                        //$scope.$apply();
                    } else {
                        var page = {
                            isActive: false,
                            pageNumber: t
                        }
                        $scope.pagination.push(page);
                        // $scope.$apply();
                    }
                }

            }
        }
        for (var t = 1; t <= 10; t++) {
            if (t == $scope.currentPageVal) {
                var page = {
                    isActive: true,
                    pageNumber: t
                }
                $scope.pagination.push(page);
                //$scope.$apply();
            } else {
                var page = {
                    isActive: false,
                    pageNumber: t
                }
                $scope.pagination.push(page);
                // $scope.$apply();
            }
        }
        $scope.BestLangList = [];
        $scope.BestSubmitList = [];
        $scope.BestSubmitLevelList = [];
        $scope.IsThisPage = function (codeInfo1) {
            var boolVal = 0;
            if ($scope.filterString1 == true){
                                    boolVal = (codeInfo1.compiler_status.toUpperCase().indexOf('ACCEPTED') >= 0)
            } 
            else if($scope.filterString2 == true)
                {
                    boolVal = (codeInfo1.compiler_status.toUpperCase().indexOf('SKIPPED') >= 0)
                }
                else if($scope.filterString3 == true ){
                     boolVal = (codeInfo1.compiler_status.toUpperCase().indexOf('MEMORY') >= 0 || codeInfo1.compiler_status.toUpperCase().indexOf('TIME') >= 0)
                }else if($scope.filterString4 == true){
                     boolVal = (codeInfo1.compiler_status.toUpperCase().indexOf('RUNTIME') >= 0 || codeInfo1.compiler_status.toUpperCase().indexOf('COMPILATION') >= 0)
                } else if($scope.filterString2 == true) {
                                    boolVal = (codeInfo1.compiler_status.toUpperCase().indexOf('WRONG') >= 0)

            } else {
                $scope.searchString = $('#searchInput').val().toUpperCase();
                if ($scope.searchString != '') {
                    boolVal = (codeInfo1.title.toUpperCase().indexOf($scope.searchString) >= 0 || codeInfo1.language.toUpperCase().indexOf($scope.searchString) >= 0 || codeInfo1.level.toUpperCase().indexOf($scope.searchString) >= 0)
                } else {
                    boolVal = codeInfo1.pageNumber === $scope.currentPageVal;
                }
            }
            return boolVal;
        }
        if (window.openDatabase) {
            mydb.transaction(function (tx) {
                tx.executeSql("DROP TABLE codes", [],
                    function (tx, results) {
                        console.log("Successfully Dropped")
                    },
                    function (tx, error) {
                        console.log("Could not delete")
                    }
                );
                tx.executeSql("DROP TABLE imageLangMap", [],
                    function (tx, results) {
                        console.log("Successfully Dropped")
                    },
                    function (tx, error) {
                        console.log("Could not delete")
                    }
                );
            });
            mydb.transaction(function (t) {
                t.executeSql("CREATE TABLE IF NOT EXISTS codes (id TEXT,title TEXT,level TEXT,rating INTEGER,users_attempted INTEGER,source_code TEXT,compiler_status TEXT,language TEXT,pageNumber INTEGER)");
                t.executeSql("CREATE TABLE IF NOT EXISTS imageLangMap (id INTEGER,language TEXT,icon TEXT)");
            });
        } else {
            console.log('error web sql not supported');
        }
        $http({
            method: 'GET',
            url: 'https://hackerearth.0x10.info/api/ctz_coders?type=json&query=list_compiler_image'
        }).then(function successCallback(response) {
            console.log(response);
            $.each(response.data, function (l, imgInfo) {
                mydb.transaction(function (t) {
                    t.executeSql("INSERT INTO imageLangMap (id,language,icon) VALUES (?,?,?)", [imgInfo.id, imgInfo.language, imgInfo.icon], function (tx, result) {

                    }, function (err) {
                        console.log(err);
                    });
                });
            });
        }, function errorCall(response) {

        });
        var counter = 1;

        for (var i = 1; i <= 10; i++) {
            var pg1 = i;
            $http({
                method: 'GET',
                url: 'https://hackerearth.0x10.info/api/ctz_coders?type=json&query=list_submissions&page=' + i
            }).then(function successCallback(response) {
                var pg2 = pg1;
                $.each(response.data.websites, function (k, codeInfo) {

                    mydb.transaction(function (t) {
                        t.executeSql("INSERT INTO codes (id,title,level,rating,users_attempted,source_code,compiler_status,language,pageNumber) VALUES (?,?,?,?,?,?,?,?,?)", [codeInfo.id, codeInfo.title, codeInfo.metadata.level, codeInfo.metadata.rating, codeInfo.metadata.users_attempted, codeInfo.source_code, codeInfo.compiler_status, codeInfo.language, counter], function (tx, result) {
                            var iconImage = '';
                            mydb.transaction(function (t) {
                                t.executeSql("SELECT * FROM imageLangMap where language=?", [codeInfo.language], function (tx, result) {
                                    iconImage = result.rows[0].icon;
                                    var x = {
                                        id: codeInfo.id,
                                        title: codeInfo.title,
                                        level: codeInfo.metadata.level,
                                        rating: codeInfo.metadata.rating,
                                        users_attempted: codeInfo.metadata.users_attempted,
                                        source_code: codeInfo.source_code,
                                        compiler_status: codeInfo.compiler_status,
                                        language: codeInfo.language,
                                        pageNumber: counter,
                                        imgIcon: iconImage
                                    }
                                    $scope.CodeList.push(x);
                                    $scope.totalCount = $scope.CodeList.length;
                                    $scope.BestLangList = [];
                                    t.executeSql("Select language, count(language) as count from codes group by language order by count(language) desc LIMIT 0,4", [], function (r, resultLang) {
                                        $.each(resultLang.rows, function (h, langs) {
                                            var objTemp = {
                                                langName: langs.language,
                                                count: langs.count
                                            }
                                            $scope.BestLangList.push(objTemp);
                                            $scope.$apply();
                                        });
                                        $scope.$apply();
                                    }, function (er) {
                                        console.log('err');
                                    });
                                    $scope.BestSubmitList = [];
                                    t.executeSql("Select max(users_attempted) as maxSubmit,title from codes order by max(users_attempted) desc LIMIT 0,1", [], function (r, resultLang) {
                                        $.each(resultLang.rows, function (h, langs) {
                                            var objTemp = {
                                                title: langs.title,
                                                attempts: langs.maxSubmit
                                            }
                                            $scope.BestSubmitList.push(objTemp);
                                            $scope.$apply();
                                        });
                                    }, function (er) {
                                        console.log('err');
                                    });

                                    $scope.BestSubmitLevelList = [];
                                    t.executeSql("Select count(level) as count,level from codes group by level", [], function (r, resultLang) {
                                        $.each(resultLang.rows, function (h, langs) {
                                            var objTemp = {
                                                level: langs.level,
                                                submission: langs.count
                                            }
                                            $scope.BestSubmitLevelList.push(objTemp);
                                            $scope.$apply();
                                        });
                                    }, function (er) {
                                        console.log('err');
                                    });
                                    $scope.$apply();
                                    // $scope.$apply();
                                    if (k == response.data.websites.length - 1) {
                                        counter++;
                                    }
                                }, function (err) {
                                    console.log(err);
                                });
                            });

                        }, function (err) {
                            console.log(err);
                        });
                    });
                });

            }, function errorCallback(response) {
                console.log('error');
            });
        }

    }]);

})();