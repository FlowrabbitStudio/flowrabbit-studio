package ai.flowrabbit.backup;

import java.io.File;
import java.io.IOException;
import java.util.List;

public interface IBackupStorage {
	
	void writeApp(String appID, File temp) throws IOException;

	void writeUsers(File temp) throws IOException;

	File getFile(String name) throws IOException;

	void onFileRestored(File file) throws IOException;

	void appendWriter(IBackupStorage childWriter);

	List<String> getAllFiles();
}
