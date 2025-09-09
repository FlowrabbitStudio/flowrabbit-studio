package ai.flowrabbit.util;

import java.io.*;
import java.util.concurrent.*;
import java.util.function.Consumer;

public class StripeCLI {

    private Process listenProcess;

    private ExecutorService executorService = Executors.newFixedThreadPool(2);

    public void listen(int port) throws IOException, InterruptedException {
        String events = "customer.subscription.created,customer.subscription.deleted," +
                        "customer.subscription.paused,customer.subscription.pending_update_applied," +
                        "customer.subscription.resumed, customer.subscription.updated,customer.subscription.pending_update_expired," +
                        "invoice.paid,invoice.payment_failed,invoice.payment_succeeded,payment_intent.succeeded";
        listen(port, events);
    }

    public void trigger(String event) throws IOException, InterruptedException {
        String cmd = String.format("stripe trigger %s", event);
        ProcessBuilder builder = new ProcessBuilder();

        String[] args = {"/bin/sh", "-c", cmd };
        builder.command(args);
        Process process = builder.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line = reader.readLine();
        while (line != null) {
            System.out.println(line);
            line = reader.readLine();
        }
        System.out.println("Done > " + event);
        process.waitFor(2000, TimeUnit.MILLISECONDS);
        process.destroyForcibly();
    }

    public void listen(int port, String events) throws IOException, InterruptedException {
        String cmd = String.format("stripe listen --events %s --forward-to localhost:%s/rest/integrations/stripe/webhook.json", events, port);
        ProcessBuilder builder = new ProcessBuilder();
        String[] args = {"/bin/sh", "-c", cmd };
        builder.command(args);
        listenProcess = builder.start();
        StreamGobbler streamGobbler = new StreamGobbler(listenProcess.getInputStream(), System.out::println);
        executorService.submit(streamGobbler);
        System.out.println("Started as " + cmd);
    }

    public void end() {
        if (listenProcess != null) {
            listenProcess.destroyForcibly();

        }
        System.out.println("end()");
    }

    private static class StreamGobbler implements Runnable {
        private InputStream inputStream;
        private Consumer<String> consumer;

        public StreamGobbler(InputStream inputStream, Consumer<String> consumer) {
            this.inputStream = inputStream;
            this.consumer = consumer;
        }

        @Override
        public void run() {
            new BufferedReader(new InputStreamReader(inputStream)).lines().forEach(consumer);
        }
    }
}
