// 解答のプロセスを起動し、終了の理由、実行時間、メモリの最大値を報告する。
//
// 使い方: launcher <報告ファイル> <スタックの上限(バイト)> <制限時間(ms)> <コマンド> [引数...]
//
// サーバー(Bun)から直接起動すると、子プロセスのメモリの最大値にサーバー自身の使用量が混ざる。
// 小さなこのプログラムから fork することで、解答だけの値を測る。
#define _GNU_SOURCE

#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/resource.h>
#include <sys/time.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

static pid_t child = -1;
static volatile sig_atomic_t timed_out = 0;

static void kill_child_group(void) {
	if (child > 0) kill(-child, SIGKILL);
}

static void on_alarm(int signal_number) {
	(void) signal_number;
	timed_out = 1;
	kill_child_group();
}

static void on_terminate(int signal_number) {
	(void) signal_number;
	kill_child_group();
}

static long long elapsed_micros(const struct timespec *from, const struct timespec *to) {
	return (to->tv_sec - from->tv_sec) * 1000000LL + (to->tv_nsec - from->tv_nsec) / 1000;
}

int main(int argc, char **argv) {
	if (argc < 5) {
		fprintf(stderr, "usage: launcher <report> <stack-bytes> <timeout-ms> <command> [args...]\n");
		return 2;
	}
	const char *report_path = argv[1];
	const long long stack_bytes = atoll(argv[2]);
	const long timeout_ms = atol(argv[3]);

	struct timespec started;
	clock_gettime(CLOCK_MONOTONIC, &started);
	child = fork();
	if (child < 0) {
		perror("fork");
		return 3;
	}
	if (child == 0) {
		// 解答が起動した子プロセスもまとめて止められるよう、別のプロセスグループにする。
		setpgid(0, 0);
		prctl(PR_SET_PDEATHSIG, SIGKILL);
		if (stack_bytes > 0) {
			const struct rlimit limit = {(rlim_t) stack_bytes, (rlim_t) stack_bytes};
			setrlimit(RLIMIT_STACK, &limit);
		}
		execvp(argv[4], argv + 4);
		fprintf(stderr, "Could not run %s: %s\n", argv[4], strerror(errno));
		_exit(127);
	}
	setpgid(child, child);

	struct sigaction on_alarm_action = {0};
	on_alarm_action.sa_handler = on_alarm;
	sigaction(SIGALRM, &on_alarm_action, NULL);
	struct sigaction on_terminate_action = {0};
	on_terminate_action.sa_handler = on_terminate;
	sigaction(SIGTERM, &on_terminate_action, NULL);
	sigaction(SIGINT, &on_terminate_action, NULL);
	if (timeout_ms > 0) {
		const struct itimerval timer = {{0, 0}, {timeout_ms / 1000, (timeout_ms % 1000) * 1000}};
		setitimer(ITIMER_REAL, &timer, NULL);
	}

	int status = 0;
	struct rusage usage;
	while (wait4(child, &status, 0, &usage) < 0) {
		if (errno != EINTR) {
			perror("wait4");
			return 3;
		}
	}
	struct timespec finished;
	clock_gettime(CLOCK_MONOTONIC, &finished);
	// 解答が残した子プロセスを止める。
	kill_child_group();

	FILE *report = fopen(report_path, "w");
	if (report == NULL) {
		perror("fopen");
		return 3;
	}
	fprintf(report, "exit %d\n", WIFEXITED(status) ? WEXITSTATUS(status) : -1);
	fprintf(report, "signal %d\n", WIFSIGNALED(status) ? WTERMSIG(status) : 0);
	fprintf(report, "timeout %d\n", timed_out ? 1 : 0);
	fprintf(report, "maxrss_kb %ld\n", usage.ru_maxrss);
	fprintf(report, "wall_us %lld\n", elapsed_micros(&started, &finished));
	fclose(report);
	return 0;
}
