package ai.flowrabbit.mocks;

import ai.flowrabbit.backup.IBackupStorage;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class MockS3BackupStorage implements IBackupStorage {

    private Map<String, File> files = new HashMap<>();

    @Override
    public void writeApp(String appID, File temp) throws IOException {
        this.files.put(appID + ".zip", temp);
    }

    public File getApp(String appID) throws IOException {
        return this.files.get(appID + ".zip");
    }

    @Override
    public void writeUsers(File temp) throws IOException {
        this.files.put("users.json", temp);
    }

    public File getUsers() throws IOException {
        return this.files.get("users.json");
    }

    @Override
    public File getFile(String name) throws IOException {
        return this.files.get(name);
    }

    public void onFileRestored (File file) {
    }

    @Override
    public void appendWriter(IBackupStorage childWriter) {

    }

    @Override
    public List<String> getAllFiles() {
        return this.files.keySet().stream().collect(Collectors.toList());
    }
}
