package ai.flowrabbit.backup;

import java.io.File;
import java.io.Serializable;

public class BackupResult implements Serializable {

	private static final long serialVersionUID = -4211776328061617002L;

	private final boolean success;
	
	private final long size;
	
	private final String file;
	
	private final Throwable throwable;

	public BackupResult(boolean success, File file) {
		this.success = success;
		this.size = file.length();
		this.throwable = null;
		this.file = file.getAbsolutePath();
	}
	
	public BackupResult(boolean success, Throwable throwable) {
		this.success = success;
		this.size = -1;
		this.throwable = throwable;
		this.file = null;
	}
	
	public Throwable throwable() {
		return throwable;
	}

	public boolean success() {
		return success;
	}
	
	public String file() {
		return this.file;
	}

	public long size() {
		return size;
	}

	
}
