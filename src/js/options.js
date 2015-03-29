var isValidJSON, getSettings, setSettings, showCurrentSettings, handleFileSelect;

isValidJSON = function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }

    return true;
};

getSettings = function (str) {
    return localStorage.settings;
};

setSettings = function (str) {
    localStorage.settings = str;
};

showCurrentSettings = function () {
    document.getElementById('current_file').innerHTML = getSettings();

    document.getElementById('no_settings').style.display = 'none';
    document.getElementById('current_file').style.display = 'block';
};

handleFileSelect = function (e) {
    var file = this.files[0],
        reader = new FileReader();

    reader.onload = function(e) {
        var content = e.target.result;

        if (content) {
            if (isValidJSON(content) === true) {
                setSettings(content);

                showCurrentSettings();
            } else {
                alert('Invalid JSON file. Please check it on jsonlint.com.');
            }
        } else {
            alert('An error has occurred. Please check your file.');
        }

        document.getElementById('settings_file').value = '';
    };

    reader.readAsText(file);
};

if (getSettings() !== undefined) {
    showCurrentSettings();
} else {
    document.getElementById('current_file').style.display = 'none';
    document.getElementById('no_settings').style.display = 'block';
}

document.getElementById('settings_file').addEventListener('change', handleFileSelect, false);
