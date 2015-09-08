var isValidJSON, getSettings, setSettings, showCurrentSettings, handleFileSelect;

isValidJSON = function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }

    return true;
};

getSettings = function () {
    return localStorage.settings;
};

setSettings = function (settings) {
    localStorage.settings = settings;
};

showCurrentSettings = function () {
    var current_file = document.getElementById('current_file');

    // Reindent
    current_file.innerHTML = JSON.stringify(JSON.parse(getSettings()), null, 4);

    document.getElementById('no_settings_found').style.display = 'none';
    document.getElementById('settings_found').style.display = 'block';
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

handleLiveSettingsChange = function (e) {
    // Escape pressed
    if (e.which === 27) {
        document.execCommand('undo');

        e.target.blur();
    }
};

saveLiveSettings = function (e) {
    var content = document.getElementById('current_file').textContent;

    if (isValidJSON(content) === true) {
        setSettings(content);

        showCurrentSettings();
    } else {
        document.execCommand('undo');

        e.target.blur();
    }
};

document.getElementById('current_file').addEventListener('keydown', handleLiveSettingsChange, true);
document.getElementById('current_file').addEventListener('blur', saveLiveSettings, true);

if (getSettings() !== undefined) {
    showCurrentSettings();
} else {
    document.getElementById('settings_found').style.display = 'none';
    document.getElementById('no_settings_found').style.display  = 'block';
}

document.getElementById('settings_file').addEventListener('change', handleFileSelect, false);
