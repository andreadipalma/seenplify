

function displayPlot(config)
  % Load Training Data
  printf('Loading and Visualizing Data ...\n');

  % Reading raw data files in the source directory
  if (exist (config.dataPath) == false)
    printf('ERROR: %s is not a data file\n', config.dataPath);
    return;
  endif

  if ((regexp (config.dataPath, "^\\.\\.?$")) || (length(regexp (config.dataPath, ".csv$")) == 0))
    printf('Skipping file %s\n', config.dataPath);
    return;
  endif

  printf('Reading %s\n', config.dataPath);

  [accX, accY, accZ, timestamp, label] = textread(config.dataPath, "%f %f %f %f %s", 'headerlines', 1, "delimiter", ",");
  m = numel(accX);

  printf('Size of file read: %d\n', m);
  if (m == 0)
    return;
  endif

  % Transform timestamps
  timestampStr = cell(m, 1);
  #dates =
  for tx = 1 : m-1
    timestampStr{tx} = formatTime(timestamp(tx)./1000);
    #printf("%f %s \n", timestamp(tx), timestampStr{tx});
  endfor;

  plotAcceleationSeries(timestamp, timestampStr, [accX, accY, accZ], label);

  [s, e] = regexp (config.dataPath, '\.0|[1-9][0-9]*\.');

  timestampLabel = config.dataPath(s:e-1);
  [V, H] = textread([config.outputPath, "/", "vh_", timestampLabel, ".csv"], "%f %f", 'headerlines', 1, "delimiter", ",");

  addVandHSeries(config.outputPath, timestamp, timestampStr, [V, H]);

  #[mV, mH, stdV, stdH, varV, varH, mdV, mdH, zcrV, zcrH, rmsV, corrV1, corrV2, corrV3, corrV4, corrV5, corrV6, corrV7, corrV8, corrV9, corrV10, corrV11, corrV12, corrH1, corrH2, corrH3, corrH4, corrH5, corrH6, corrH7, corrH8, corrH9, corrH10, corrH11, corrH12, ps1, ps2, ps3, ps4, ps5, ps6, ps7, ps8, ps9, ps10, ps11, ps12, sEntropyV, sEntropyH, CfV, CfH, SfV, SfH, WfV, WfH, KfV, KfH, CtV, CtH, StV, StH, WtV, WtH, KtV, KtH, class] = textread([config.outputPath, "/", "feature_", timestampLabel, ".csv"],
  #Feat = textread([config.outputPath, "/", "feature_", timestampLabel, ".csv"],
#         "%f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f,  \
#          %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, \
#          %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, \
#          %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, \
#          %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, \
#          %f, %f, %f, %f, %f, %s", 'headerlines', 1, "delimiter", ",");

  %keyboard;
  [mV, mH, stdV, stdH, varV, varH, mdV, mdH, zcrV, zcrH, rmsV,...
          corrV1, corrV2, corrV3, corrV4, corrV5, corrV6, corrV7, corrV8, corrV9, corrV10, corrV11, corrV12,...
          corrH1, corrH2, corrH3, corrH4, corrH5, corrH6, corrH7, corrH8, corrH9, corrH10, corrH11, corrH12,...
          ps1, ps2, ps3, ps4, ps5, ps6, ps7, ps8, ps9, ps10, ps11, ps12,...
          sEntropyV, sEntropyH, CfV, CfH, SfV, SfH, WfV, WfH, KfV, KfH, CtV, CtH, StV, StH, WtV, WtH, KtV, KtH, class] = coltextread([config.outputPath, "/", "feature_", timestampLabel, ".csv"], ",");

  # Prepare plot pages
  #isOk = cellfun (@allEquals, class, class{1});
  #if (isOk == true)
  #  classDescr = class{1};
  #endif;
  featureMatrix = [[cell2mat(mV'), cell2mat(mH')], [cell2mat(stdV'), cell2mat(stdH')], [cell2mat(varV'), cell2mat(varH')], [cell2mat(mdV'), cell2mat(mdH')], [cell2mat(zcrV'), cell2mat(zcrH')], [cell2mat(rmsV'), zeros(length(rmsV),1)]];
  plotFeaturesOnNewPage(config.outputPath, timestamp, timestampStr, featureMatrix, 1, 2, 'Statistics');

  featureMatrix = [cell2mat(corrV1'), cell2mat(corrV2'), cell2mat(corrV3'), cell2mat(corrV4'), cell2mat(corrV5'), cell2mat(corrV6'), cell2mat(corrV7'), cell2mat(corrV8'), cell2mat(corrV9'), cell2mat(corrV10'), cell2mat(corrV11'), cell2mat(corrV12')];
  plotFeaturesOnNewPage(config.outputPath, timestamp, timestampStr, featureMatrix, 2, 12, 'Correlation V');

  featureMatrix = [cell2mat(corrH1'), cell2mat(corrH2'), cell2mat(corrH3'), cell2mat(corrH4'), cell2mat(corrH5'), cell2mat(corrH6'), cell2mat(corrH7'), cell2mat(corrH8'), cell2mat(corrH9'), cell2mat(corrH10'), cell2mat(corrH11'), cell2mat(corrH12')];
  plotFeaturesOnNewPage(config.outputPath, timestamp, timestampStr, featureMatrix, 3, 12, 'Correlation V');

  featureMatrix = [cell2mat(ps1'), cell2mat(ps2'), cell2mat(ps3'), cell2mat(ps4'), cell2mat(ps5'), cell2mat(ps6'), cell2mat(ps7'), cell2mat(ps8'), cell2mat(ps9'), cell2mat(ps10'), cell2mat(ps11'), cell2mat(ps12')];
  plotFeaturesOnNewPage(config.outputPath, timestamp, timestampStr, featureMatrix, 4, 12, 'Power Spectrum');
  featureMatrix = [[cell2mat(sEntropyV'), cell2mat(sEntropyH')], [cell2mat(CfV'), cell2mat(CfH')], [cell2mat(SfV'), cell2mat(SfH')], [cell2mat(WfV'), cell2mat(WfH')], [cell2mat(KfV'), cell2mat(KfH')], [cell2mat(CtV'), cell2mat(CtH')],  [cell2mat(StV'), cell2mat(StH')], [cell2mat(WtV'), cell2mat(WtH')],  [cell2mat(KtV'), cell2mat(KtH')]];

  plotFeaturesOnNewPage(config.outputPath, timestamp, timestampStr, featureMatrix, 5, 2, 'Others');

endfunction;

function ret = allEquals (x, value)
  for i = 1 : (length(x) - 1)
    if (x != value)
      ret = false;
    endif;
  endfor;
endfunction

function plotAcceleationSeries(timestamp, timestampStr, signal, label)
  # construct signal and plot in the time domain
  setenv("GNUTERM", "qt");
  figure('Position',[0,0,1200,800]);
  t = timestamp;
  y = signal;
  subplot(2,1,1);
  hold on;
  #set(gca(),'xtick', t);
  set(gca(),'xticklabel',timestampStr(1:uint64(length(timestampStr)/7):end-1));
  plot(y(1:length(t), 1), '-r', 'LineWidth',2);
  plot(y(1:length(t), 2), '-g', 'LineWidth',2);
  plot(y(1:length(t), 3), '-b', 'LineWidth',2);

  grid on;

  xlabel("TIME (msec)", "fontweight", "bold");
  ylabel("Acceleration MAGNITUDE", "fontweight", "bold");
  legend('AccX','AccY','AccZ');
  title('Plot of acceleration on three axis after filtering');
  h=get (gcf, "currentaxes");
  set(h,"fontweight","bold","linewidth",2)
  hold off;
  #pause;
endfunction;

function addVandHSeries(path, timestamp, timestampStr, signal)
  # construct signal and plot in the time domain
  subplot(2,1,2);
  hold on;
  t = timestamp;
  y = signal;
  set(gca(),'xticklabel',timestampStr(1:uint64(length(timestampStr)/7):end-1));
  plot(y(1:length(t), 1), '-r', 'LineWidth',2);
  plot(y(1:length(t), 2), '-b', 'LineWidth',2);
  grid on;

  legend('Input Data','Filtered Data','Location','NorthWest');
  title('Plot of Input and Filtered Data');
  h=get (gcf, "currentaxes");
  set(h,"fontweight","bold","linewidth",2)

  hold off;
  #keyboard;
  set (1, "defaultaxesfontname", "Helvetica");

  print (1, [path "/" "main_plot.jpeg"], "-djpeg");
endfunction;


function plotFeaturesOnNewPage(path, timestamp, timestampStr, signals, indx, numOnPlot, titleDescr)
%keyboard;
  h = figure('Position',[0,0,1200,800]);
  numRows = size(signals, 1);
  numFeatures = size(signals, 2);
  n = 1;
  while n <= numFeatures
    printf('Run ...%d\n', n);
    subplot(floor(numFeatures / numOnPlot),2,n);
    hold on;
    t = timestamp;
    set(gca(),'xticklabel',timestampStr(1:uint64(length(timestampStr)/7):end-1));
    for i = 0:numOnPlot-1
      y = signals(:,n+i);
    #  y1 = signals(:,n + 1);

      len_y = length(y);
      len_t = length(t);
      #yExpand = [reshape(repmat(y', len_t / len_y, 1), [],1); repmat(y(len_y), len_t - len_y*floor(len_t / len_y) , 1)];
      #plot(yExpand(:), '--b', 'LineWidth',2)
      plot(y, '-b', 'LineWidth',2);
    endfor

    xlabel("TIME (msec)", "fontweight", "bold");
    ylabel(titleDescr, "fontweight", "bold");
    title(titleDescr);

    subplot(floor(numFeatures / 2),2,n + 1);
    hist(y, 'b');
    #hist(y1, 'r');
    n = n + numOnPlot;
    grid on;
    set (h, "defaultaxesfontname", "Helvetica"),
    print (h, [path "/" "plot_features" num2str(indx) ".jpg"], "-djpeg");
    #saveas(h, [path "/" "plot_features" indx ".jpg"], dpi=150);
  end;

  pause;
    #savbeas(1, "signal_3freqs.jpg", dpi=150)
endfunction;

function varargout = coltextread(fname, delim)

    % Initialize the variable output argument
    varargout = cell(nargout, 1);

    % Initialize elements of the cell array to nested cell arrays
    % This syntax is due to {:} producing a comma-separated
    [varargout{:}] = deal(cell());

    fid = fopen(fname, 'r');

    while true
        % Get the current line
        ln = fgetl(fid);

        % Stop if EOF
        if ln == -1
            break;
        endif

        % Split the line string into components and parse numbers
        elems = strsplit(ln, delim);
        nums = str2double(elems);

        nans = isnan(nums);

        % Special case of all strings (header line)
        if all(nans)
            continue;
        endif

        % Find the indices of the NaNs
        % (i.e. the indices of the strings in the original data)
        idxnans = find(nans);

        % Assign each corresponding element in the current line
        % into the corresponding cell array of varargout
        for i = 1:nargout
            % Detect if the current index is a string or a num
            if any(ismember(idxnans, i))
                varargout{i}{end+1} = elems{i};
            else
                varargout{i}{end+1} = nums(i);
            endif
        endfor
    endwhile

endfunction

%  figure;
%  plot(n);
%  hold on;
%  plot(ones(1, length(n))*mean(n));
%  plot(v);
%  title ("Measure of the calculated gravity");
%  xlabel ("average gravity component");
%  ylabel ("variance of gravity component");
%  hold off;
% Calculate V and H using estimated gravity vectory

  %keyboard;
%  vv = [vv; repmat(0, abs(length(a)-length(vv)), 3)];
%  maxInd = max(length(a), length(vv));
%  [V, H] = mizellEstimate(a, temp_v);

%  figure;
%%  plot(V, 'r');
%  hold on;
%  plot(H, 'b');
%  title ("Vertical and Horizontal components of the gravity");
%%  xlabel ("Time");
%  ylabel ("Acceleration (in g)");
