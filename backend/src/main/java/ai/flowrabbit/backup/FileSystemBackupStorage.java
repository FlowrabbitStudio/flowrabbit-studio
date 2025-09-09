package ai.flowrabbit.backup;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FileSystemBackupStorage implements IBackupStorage{
	
	
	private Logger logger = LoggerFactory.getLogger(FileSystemBackupStorage.class);

	private final String folder;

	private IBackupStorage childWriter;

	public FileSystemBackupStorage(String folder) {
		this.folder = folder;
	}

	public void appendWriter(IBackupStorage childWriter) {
		this.childWriter = childWriter;
	}

	@Override
	public List<String> getAllFiles() {
		return Arrays.stream(new File(folder).listFiles())
				.map(file -> file.getName())
				.collect(Collectors.toList());
	}

	public void writeUsers(File temp) throws IOException{
		logger.debug("writeUsers() > " + temp.getAbsolutePath());
		File dest = new File(folder + File.separator  + "users.json");
		if (!dest.exists()){
			logger.info("writeApp() > Create new " + dest.getAbsolutePath() + " > " + temp.getAbsolutePath());
			dest.createNewFile();
		} else {
			logger.info("writeApp() > Overwrite " + temp.getAbsolutePath());
		}
		Files.copy(temp.toPath(), dest.toPath(), StandardCopyOption.REPLACE_EXISTING);

		if (this.childWriter != null) {
			try {
				this.childWriter.writeUsers(temp);
			} catch (Exception e) {
				logger.error("writeApp() > Could not call childWriter ");
			}
		}
	}
	
	public File getUsers() throws IOException{
		return this.getFile("users.json");
	}


	public File getApp(String appID) throws IOException {
		return this.getFile(appID + ".zip");
	}

	@Override
	public File getFile(String name) throws IOException {
		logger.debug("getFile() > enter > file: " + name);
		File f = new File(this.folder + File.separator + name);
		if (f.exists()) {
			return f;
		}
		logger.error("getFile() > No backup for file :" + name);
		return null;
	}

	@Override
	public void writeApp(String appID, File temp) throws IOException {
		logger.debug("writeApp() > " + appID + " > " + temp.getAbsolutePath());
		File dest = new File(folder + File.separator + appID + ".zip");
		if (!dest.exists()){
			logger.info("writeApp() > Create new " + dest.getAbsolutePath() + " > " + temp.getAbsolutePath());
			dest.createNewFile();
		} else {
			logger.info("writeApp() > Overwrite " + appID + " > " + temp.getAbsolutePath());
		
		}
		Files.copy(temp.toPath(), dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
		if (this.childWriter != null) {
			try {
				this.childWriter.writeApp(appID, temp);
			} catch (Exception e) {
				logger.error("writeApp() > Could not call childWriter ");
			}
		}
	}

	public void onFileRestored (File file) {

	}



}
