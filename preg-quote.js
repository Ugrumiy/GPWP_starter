/**
 * Created by:  malyusha 10.06.16
 * Email:       lovecoding@yandex.ru
 * Developer:   Igor Malyuk
 */

'use strict';

let preg_quote = str => {
    return str.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
};

module.exports = preg_quote;